import { redirect } from 'next/navigation'

export default async function Page(props) {
  const p = await props
  const params = await p.params

  const restaurantSlug = params?.restaurantSlug
  const tableCode = params?.tableCode

  redirect(
    `/qr/${encodeURIComponent(restaurantSlug)}?code=${encodeURIComponent(tableCode)}`
  )
}