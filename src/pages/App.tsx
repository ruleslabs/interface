import { Route, Routes } from 'react-router-dom'

import Home from './Home'

import Cookies from './Cookies'
import Pricing from './Pricing'
import Privacy from './Privacy'
import Terms from './Terms'
import Packs from './packs'

export default function App() {
  return (
    <Routes>
      <Route path={'/'} element={Home.withLayout()} />

      <Route path={'cookies'} element={Cookies.withLayout()} />
      <Route path={'pricing'} element={Pricing.withLayout()} />
      <Route path={'privacy'} element={Privacy.withLayout()} />
      <Route path={'terms'} element={Terms.withLayout()} />

      <Route path={'packs'} element={Packs.withLayout()} />
    </Routes>
  )
}
