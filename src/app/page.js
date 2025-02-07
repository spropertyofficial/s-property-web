import CategoryMenu from '@/components/CategoryMenu'
import Header from '@/components/Header'
import PropertyListing from '@/components/property/PropertyListing'

export default function Home() {
  return (
    <main>
      <Header />
      <CategoryMenu />
      <PropertyListing />

    </main>
  )
}