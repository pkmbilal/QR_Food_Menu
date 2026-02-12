import QRCodeClientPage from './QRCodeClientPage'

export default async function Page(props) {
  const p = await props
  const resolvedParams = await p.params
  const restaurantSlug = resolvedParams?.restaurantSlug

  return <QRCodeClientPage restaurantSlug={restaurantSlug} />
}
