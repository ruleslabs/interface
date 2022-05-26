import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'

import LegalLayout from '@/components/Layout/Legal'

const AVAILABLE_PACKS_QUERY = gql`
  query {
    allAvailablePacks {
      displayName
      price
      cardsPerPack
      season
      cardModels {
        cardModel {
          name
        }
      }
    }
  }
`

const ALL_CARD_MODELS_QUERY = gql`
  query {
    allCardModels {
      name
    }
  }
`

function Pricing() {
  const packsQuery = useQuery(AVAILABLE_PACKS_QUERY)
  const allCardModelsQuery = useQuery(ALL_CARD_MODELS_QUERY)

  const packs = useMemo(() => packsQuery.data?.allAvailablePacks ?? [], [packsQuery])
  const allCardModels = useMemo(() => allCardModelsQuery.data?.allCardModels ?? [], [allCardModelsQuery])

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
              <strong>Nombre de cartes par pack</strong>
            </td>
            <td>
              <strong>Prix</strong>
            </td>
            <td>
              <strong>Cartes possibles</strong>
            </td>
          </tr>
          {packs.map((pack: any, index: number) => (
            <tr key={`pack-princing-${index}`} className="even">
              <td>{pack.displayName}</td>
              <td>{pack.cardsPerPack}</td>
              <td>{(pack.price / 100).toFixed(2)}€</td>
              <td>
                {pack.cardModels.length
                  ? pack.cardModels.map((packCardModel: any, cardIndex: number) => (
                      <div key={`pack-pricing-card-models-${index}-${cardIndex}`}>
                        {packCardModel.cardModel.name}
                        <br />
                      </div>
                    ))
                  : `Toutes les cartes communes de la saison ${pack.season}`}
              </td>
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

      <ol start={2} type="1">
        <li>
          <p>
            <strong>2.1 Liste des cartes existantes</strong>
          </p>
        </li>
      </ol>

      <ul>
        {allCardModels.map((cardModel: any, index: number) => (
          <li key={`all-card-models-${index}`}>
            <p>{cardModel.name}</p>
          </li>
        ))}
      </ul>

      <ol start={2} type="1">
        <li>
          <p>
            <strong>2.2 Commissions du marché secondaire</strong>
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
