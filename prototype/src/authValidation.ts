export function isPasswordValid(password: string) {
  return password.length >= 8
    && /^[\x20-\x7E]+$/.test(password)
    && /[A-Za-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9 ]/.test(password)
}
