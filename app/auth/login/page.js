const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    // Sign in user
    const { data, error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Redirect to main dashboard (it will redirect based on role)
    router.push('/dashboard')
    
  } catch (err) {
    setError('Something went wrong: ' + err.message)
    setLoading(false)
  }
}