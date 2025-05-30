'use client'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import ErrorText from '@/components/typography/error-text'
import Image from 'next/image'
import loginSideImage from '@/../public/images/login/loginSideImage.png'
import mainLogo from '@/../public/images/login/logo.svg'
import { APP_NAME, APP_NAME_TITLE, PRIVY_APP_NAME, USER_ROLE, USER_ROLES } from '@/helper/constants'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth'

const LoginPage = (): JSX.Element => {
  const [isPatient, setIsPatient] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { ready, authenticated, getAccessToken } = usePrivy()
  const { authLogin, authLogout } = useAuth()

  const REGISTER_PATIENT_USER = gql`
    mutation createAuthToken($role: UserRole!) {
      createAuthToken(role: $role) {
        authToken
        refreshToken
        user {
          role
        }
      }
    }
  `
  const router = useRouter()
  const disableLogin = !ready
  const [registerUser, { data, error }] = useMutation(REGISTER_PATIENT_USER, {
    context: { appTokenName: PRIVY_APP_NAME + ':token' }
  })

  const readyAndNoAuthentication = () => {
    if (ready) {
      if (!authenticated) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    authLogout()
  }, [])

  useEffect(() => {
    readyAndNoAuthentication()
  }, [ready, authenticated])

  const handleRegister = async () => {
    const role = isPatient ? USER_ROLES.Patient : USER_ROLES.Doctor
    await registerUser({ variables: { role } })
      .then(async (result) => {
        localStorage.setItem(APP_NAME + ':token', result?.data?.createAuthToken?.authToken)
        localStorage.setItem(APP_NAME + ':refreshToken', result?.data?.createAuthToken?.refreshToken)
        const roleUrl = (result?.data?.createAuthToken?.user?.role as string).toLowerCase()
        localStorage.setItem(USER_ROLE, roleUrl)
        await authLogin(result?.data?.createAuthToken?.authToken)
        setIsLoading(false)
        const loginRolePatient = roleUrl == USER_ROLES.Patient.toLowerCase()
        if (loginRolePatient) router.push('/patient/documents')
        else router.push('/doctor/dashboard')
      })
      .catch((error) => {
        setIsLoading(false)
        console.error({ error })
        setErrorMessage(error?.message)
      })
  }

  const changeRole = () => {
    setIsPatient(!isPatient)
  }

  const { login } = useLogin({
    onComplete: async (user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount) => {
      setIsLoading(true)
      const accessToken = await getAccessToken()
      if (accessToken) localStorage.setItem(PRIVY_APP_NAME + ':token', accessToken)
      handleRegister()
      setIsLoading(false)
    },
    onError: (error) => {
      setIsLoading(false)
      console.error(error)
    }
  })

  const submitForm = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    login()
  }
  // if (!ready || (ready && authenticated))
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <span className="loading loading-spinner loading-lg"></span>
  //     </div>
  //   )
  return (
    <>
      <Head>
        <title>Login · {APP_NAME_TITLE}</title>
      </Head>
      <div className="min-h-screen bg-base-200 flex items-center">
        <div className="card mx-auto w-full max-w-5xl shadow-xl">
          <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
            <div>
              <div className="hero min-h-full rounded-l-xl bg-base-200">
                <div className="hero-content py-12">
                  <div className="max-w-md">
                    <h1 className="text-3xl text-center font-bold ">
                      <Image src={mainLogo} className="w-12 inline-block mr-2 mask mask-circle" alt="dashwind-logo" />
                      {APP_NAME_TITLE}
                    </h1>

                    <div className="text-center mt-12">
                      <Image src={loginSideImage} alt="Dashwind Admin Template" className="w-48 inline-block" />
                    </div>

                    <h1 className="text-2xl mt-8 font-bold">{isPatient ? 'Patient' : 'Health Care Provider'}</h1>

                    {isPatient && (
                      <>
                        <p className="py-2 mt-4">
                          ✓ <span className="font-semibold">Securely access</span> your medical records
                        </p>
                      </>
                    )}

                    {!isPatient && (
                      <>
                        <p className="py-2 mt-4">
                          ✓ <span className="font-semibold">Decentrailized</span> storage medical records for all your
                          patients
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="py-24 px-10">
              <form onSubmit={(e) => submitForm(e)}>
                <div className="mb-4">
                  <p className="text-left text-lg   md:mt-0 mt-6 mb-12  font-semibold">
                    Login - {isPatient ? 'Patient' : 'Health Care Provider'}
                  </p>
                </div>

                <div className="mt-8">
                  {errorMessage && <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>}
                  <button type="submit" className={`btn mt-2 w-full btn-primary`} disabled={disableLogin}>
                    {isLoading && <span className="loading loading-spinner"></span>}Login
                  </button>
                  <p className="text-center text-lg mt-5 font-semibold">
                    Not a {isPatient ? 'Patient' : 'Health Care Provider'}{' '}
                    <button
                      type="button"
                      className={`btn btn-primary`}
                      onClick={() => changeRole()}
                      disabled={disableLogin}
                    >
                      Change
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
