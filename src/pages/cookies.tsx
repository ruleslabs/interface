import LegalLayout from '@/components/Layout/Legal'

function Privacy() {
  return (
    <>
      <h1 id="title">POLITIQUE COOKIES</h1>
      <ol type="1">
        <li>
          <p>
            <strong>
              <u>Qu&apos;est-ce qu&apos;un Cookie ?</u>
            </strong>
          </p>
        </li>
      </ol>
      <p>
        Lors de l&apos;utilisation de notre plateforme RULES (ci-après la « <strong>Plateforme</strong> »), des traceurs
        (ci-après désignés le « <strong>Cookie</strong> » ou les « <strong>Cookies</strong> ») sont déposés sur votre
        terminal.
      </p>
      <p>
        Un Cookie est un petit fichier, souvent crypté, stocké dans votre navigateur ou votre terminal et identifié par
        un nom. Il est déposé lors de la consultation d&apos;une application. Chaque fois que vous revenez sur
        l&apos;application en question, le Cookie est récupéré sur votre navigateur ou sur votre terminal. Ainsi, chaque
        fois que vous consultez l&apos;application, le navigateur est reconnu.
      </p>
      <p>
        Le dépôt de ces Cookies est susceptible de nous permettre d&apos;accéder à vos données de navigation et/ou à des
        données à caractère personnel vous concernant.
      </p>
      <ol start={2} type="1">
        <li>
          <p>
            <strong>
              <u>Identification des Cookies</u>
            </strong>
          </p>
        </li>
      </ol>
      <ul>
        <li>
          <p>
            <strong>Cookies techniques et fonctionnels</strong>
          </p>
        </li>
      </ul>
      <p>
        Les Cookies techniques et fonctionnels sont nécessaires au bon fonctionnement de la Plateforme et pour vous
        fournir nos services. Ils sont utilisés tout au long de votre navigation, afin de la faciliter et
        d&apos;exécuter certaines fonctions.
      </p>
      <p>
        Un Cookie technique peut par exemple être utilisé pour mémoriser vos réponses renseignées dans un formulaire ou
        encore vos préférences s&apos;agissant de la langue ou de la présentation de la Plateforme, lorsque de telles
        options sont disponibles.
      </p>
      <p>Nous utilisons les Cookies techniques et fonctionnels suivants :</p>
      <table>
        <tbody>
          <tr className="odd">
            <td>
              <strong>Nom du Cookie</strong>
            </td>
            <td>
              <strong>Fonction du Cookie</strong>
            </td>
            <td>
              <strong>Durée de conservation</strong>
            </td>
          </tr>
          <tr className="even">
            <td>REFRESH_TOKEN</td>
            <td>Rafraîchir le token d&apos;identification de la session en cours lorsque ce dernier expire.</td>
            <td>7 jours</td>
          </tr>
        </tbody>
      </table>
      <ol start={3} type="1">
        <li>
          <p>
            <strong>
              <u>Vos préférences en matière de Cookies</u>
            </strong>
          </p>
        </li>
      </ol>
      <ul>
        <li>
          <p>
            <strong>Cookies pouvant être déposés sans consentement</strong>
          </p>
        </li>
      </ul>
      <p>Certains Cookies ne nécessitent pas votre consentement, c&apos;est le cas :</p>
      <ul>
        <li>
          <p>Des Cookies techniques et fonctionnels qui sont nécessaires au fonctionnement de la Plateforme ;</p>
        </li>
        <li>
          <p>
            De certains Cookies de mesure d&apos;audience ou des Cookies qui permettent de tester des versions
            différentes de la Plateforme à des fins d&apos;optimisation des choix éditoriaux.
          </p>
        </li>
      </ul>
      <ul>
        <li>
          <p>
            <strong>Le paramétrage de votre navigateur</strong>
          </p>
        </li>
      </ul>
      <p>
        Il est également possible de paramétrer votre navigateur afin qu&apos;il accepte ou refuse certains Cookies.
      </p>
      <p>Chaque navigateur propose des modalités de configuration différentes.</p>
    </>
  )
}

Privacy.getLayout = (page: JSX.Element) => {
  return <LegalLayout>{page}</LegalLayout>
}

export default Privacy
