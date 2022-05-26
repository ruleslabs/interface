import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'

import LegalLayout from '@/components/Layout/Legal'

const AVAILABLE_PACKS_QUERY = gql`
  query {
    allAvailablePacks {
      displayName
      price
      cardsPerPack
    }
  }
`

function Pricing() {
  const packsQuery = useQuery(AVAILABLE_PACKS_QUERY)

  const packs = useMemo(() => packsQuery.data?.allAvailablePacks ?? [], [packsQuery])

  if (packsQuery.loading || packsQuery.error) return null

  return (
    <>
      <h1 id="title">TARIFICATION</h1>

      <ol type="1">
        <li>
          <p>
            <strong>
              <u>Packs</u>
            </strong>
          </p>
        </li>
      </ol>

      <table>
        <tbody>
          <tr className="odd">
            <td>
              <strong>Nom du Pack</strong>
            </td>
            <td>
              <strong>Nombre de cartes</strong>
            </td>
            <td>
              <strong>Prix</strong>
            </td>
          </tr>
          {packs.map((pack, index: number) => (
            <tr key={`pack-princing-${index}`} className="even">
              <td>{pack.displayName}</td>
              <td>{pack.cardsPerPack}</td>
              <td>{(pack.price / 100).toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ol start={2} type="1">
        <li>
          <p>
            <strong>
              <u>Cartes</u>
            </strong>
          </p>
        </li>
      </ol>

      <table>
        <tbody>
          <tr className="odd">
            <td>
              <strong>Commission Rules</strong>
            </td>
            <td>
              <strong>Commission Artiste</strong>
            </td>
            <td>
              <strong>Total</strong>
            </td>
          </tr>
          <tr className="even">
            <td>2.5%</td>
            <td>2.5%</td>
            <td>5%</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

Pricing.getLayout = (page: JSX.Element) => {
  return <LegalLayout>{page}</LegalLayout>
}

export default Pricing
