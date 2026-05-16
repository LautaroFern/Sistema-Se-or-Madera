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

const FETCH_TIMEOUT = 12000

function fetchWithTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  )
  return Promise.race([Promise.resolve(promise), timeoutPromise])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)

  const fetchUserRole = useCallback(async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await fetchWithTimeout(
        supabase
          .from('usuario')
          .select('id, nombre, mail, dni, id_rol')
          .eq('id', userId)
          .single(),
        FETCH_TIMEOUT
      )

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
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null

    const resetLoading = () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      loadingTimeout = setTimeout(() => {
        if (isMounted.current) {
          setLoading(false)
        }
      }, 5000)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return

        switch (event) {
          case 'INITIAL_SESSION': {
            resetLoading()
            try {
              if (session?.user) {
                const userData = await fetchUserRole(session.user.id)
                if (isMounted.current) {
                  setUser(userData)
                }
              }
            } catch {
              if (isMounted.current) {
                setUser(null)
              }
            } finally {
              if (loadingTimeout) {
                clearTimeout(loadingTimeout)
              }
              if (isMounted.current) {
                setLoading(false)
              }
            }
            break
          }

          case 'SIGNED_IN': {
            if (session?.user) {
              try {
                const userData = await fetchUserRole(session.user.id)
                if (isMounted.current) {
                  setUser(userData)
                }
              } catch {
                if (isMounted.current) {
                  setUser(null)
                }
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
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
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
        setLoading(false)
        return { error: error.message }
      }

      if (data.user) {
        const userData = await fetchUserRole(data.user.id)
        if (isMounted.current) {
          setUser(userData)
          setLoading(false)
        }
        if (!userData) {
          return { error: 'No se pudo obtener la información del usuario' }
        }
        return { error: null }
      }

      setLoading(false)
      return { error: null }
    } catch {
      setLoading(false)
      return { error: 'Error inesperado al iniciar sesión' }
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