export const credentials = {
  client_email: process.env.GOOGLE_ACCOUNT_EMAIL!,
  private_key: process.env.GOOGLE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n')
}
