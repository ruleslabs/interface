import { Route, Routes } from 'react-router-dom'

import Home from './Home'
import Cookies from './Legal/Cookies'
import Pricing from './Legal/Pricing'
import Privacy from './Legal/Privacy'
import Terms from './Legal/Terms'
import EthereumSettings from './Settings/Ethereum'
import SecuritySettings from './Settings/Security'
import SessionsSettings from './Settings/Sessions'
import StarknetSettings from './Settings/Starknet'
import UserCards from './User/Cards'
import UserPacks from './User/Packs'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={Home.withLayout()} />

      <Route path="cookies" element={Cookies.withLayout()} />
      <Route path="pricing" element={Pricing.withLayout()} />
      <Route path="privacy" element={Privacy.withLayout()} />
      <Route path="terms" element={Terms.withLayout()} />

      <Route path="user/:userSlug/cards" element={UserCards.withLayout()} />
      <Route path="user/:userSlug/packs" element={UserPacks.withLayout()} />

      <Route path="settings/ethereum" element={EthereumSettings.withLayout()} />
      <Route path="settings/security" element={SecuritySettings.withLayout()} />
      <Route path="settings/sessions" element={SessionsSettings.withLayout()} />
      <Route path="settings/starknet" element={StarknetSettings.withLayout()} />
    </Routes>
  )
}
