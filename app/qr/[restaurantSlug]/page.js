import QRCodeClientPage from './QRCodeClientPage'

export default async function Page(props) {
  const p = await props
  const params = await p.params
  const restaurantSlug = params?.restaurantSlug

  return <QRCodeClientPage restaurantSlug={restaurantSlug} />
}