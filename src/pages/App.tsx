import { Route, Routes } from 'react-router-dom'

import Home from './Home'
import Packs from './Packs'
import Community from './Community'
import Marketplace from './Marketplace'

import Cookies from './Legal/Cookies'
import Pricing from './Legal/Pricing'
import Privacy from './Legal/Privacy'
import Terms from './Legal/Terms'

import UserActivity from './User/Activity'
import UserRuledex from './User/Ruledex'
import UserPacks from './User/Packs'
import UserProfile from './User'
import UserCards from './User/Cards'

import EthereumSettings from './Settings/Ethereum'
import LiveEventsSettings from './Settings/LiveEvents'
import ProfileSettings from './Settings/Profile'
import SecuritySettings from './Settings/Security'
import SessionsSettings from './Settings/Sessions'
import StarknetSettings from './Settings/Starknet'

import Pack from './Pack'
import PackOpening from './Pack/Open'

import Card from './Card'
import CardModel from './Card/Model'
import Offers from './Card/Offers'

import Newcomer from './Newcomer'
import Onboard from './Onboard'

export default function App() {
  return (
    <Routes>
      <Route path={'/'} element={Home.withLayout()} />
      <Route path={'packs'} element={Packs.withLayout()} />
      <Route path={'marketplace'} element={Marketplace.withLayout()} />
      <Route path={'community'} element={Community.withLayout()} />

      <Route path={'cookies'} element={Cookies.withLayout()} />
      <Route path={'pricing'} element={Pricing.withLayout()} />
      <Route path={'privacy'} element={Privacy.withLayout()} />
      <Route path={'terms'} element={Terms.withLayout()} />

      <Route path={'user/:userSlug/activity'} element={UserActivity.withLayout()} />
      <Route path={'user/:userSlug/cards'} element={UserCards.withLayout()} />
      <Route path={'user/:userSlug'} element={UserProfile.withLayout()} />
      <Route path={'user/:userSlug/packs'} element={UserPacks.withLayout()} />
      <Route path={'user/:userSlug/ruledex'} element={UserRuledex.withLayout()} />

      <Route path={'settings/ethereum'} element={EthereumSettings.withLayout()} />
      <Route path={'settings/live-events'} element={LiveEventsSettings.withLayout()} />
      <Route path={'settings/profile'} element={ProfileSettings.withLayout()} />
      <Route path={'settings/security'} element={SecuritySettings.withLayout()} />
      <Route path={'settings/sessions'} element={SessionsSettings.withLayout()} />
      <Route path={'settings/starknet'} element={StarknetSettings.withLayout()} />

      <Route path={'pack/:packSlug'} element={Pack.withLayout()} />
      <Route path={'pack/:packSlug/open'} element={PackOpening.withLayout()} />

      <Route path={'card/:cardModelSlug'} element={CardModel.withLayout()} />
      <Route path={'card/:cardModelSlug/:serialNumber'} element={Card.withLayout()} />
      <Route path={'card/:cardModelSlug/offers'} element={Offers.withLayout()} />

      <Route path={'onboard'} element={Onboard.withLayout()} />
      <Route path={'newcomer'} element={Newcomer.withLayout()} />
    </Routes>
  )
}
