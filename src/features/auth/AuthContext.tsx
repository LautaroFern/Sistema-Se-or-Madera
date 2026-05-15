import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { AuthUser } from '../../types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)

  const fetchUserRole = useCallback(async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('id, nombre, mail, dni, id_rol')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        email: data.mail,
        nombre: data.nombre,
        rol: data.id_rol === 1 ? 'admin' as const : 'empleado' as const,
        id_rol: data.id_rol,
      }
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    isMounted.current = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return

        switch (event) {
          case 'INITIAL_SESSION': {
            try {
              if (session?.user) {
                const userData = await fetchUserRole(session.user.id)
                if (isMounted.current) {
                  setUser(userData)
                }
              }
            } finally {
              if (isMounted.current) {
                setLoading(false)
              }
            }
            break
          }

          case 'SIGNED_IN': {
            if (session?.user) {
              const userData = await fetchUserRole(session.user.id)
              if (isMounted.current) {
                setUser(userData)
              }
            }
            break
          }

          case 'TOKEN_REFRESHED': {
            break
          }

          case 'SIGNED_OUT': {
            if (isMounted.current) {
              setUser(null)
              setLoading(false)
            }
            break
          }

          default:
            break
        }
      }
    )

    return () => {
      isMounted.current = false
      subscription.unsubscribe()
    }
  }, [fetchUserRole])

  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        const userData = await fetchUserRole(data.user.id)
        if (isMounted.current) {
          setUser(userData)
        }
        if (!userData) {
          return { error: 'No se pudo obtener la información del usuario' }
        }
        return { error: null }
      }

      return { error: null }
    } catch {
      return { error: 'Error inesperado al iniciar sesión' }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      if (isMounted.current) {
        setUser(null)
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}