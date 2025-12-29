'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import TabContentDetail from './TabContentDetail'

type TabValue = 'accessory' | 'border' | 'title' | 'nickname'

type DecorationItem = {
  id: string
  name: string
  price: number
  category: 'accessory' | 'border' | 'title' | 'nickname'
  style: string | null
  source: string | null
}

interface Props {
  onSelectPreview: (item: DecorationItem) => void
  onPurchased: (newPoint: number) => void
}

const MenuTab = ({ onSelectPreview, onPurchased }: Props) => {
  const [tab, setTab] = useState<TabValue>('accessory')
  const [items, setItems] = useState<DecorationItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)

      const res = await fetch(`/api/users/shops?category=${tab}`)
      const data = await res.json()

      setItems(data.rows ?? [])
      setLoading(false)
    }

    fetchItems()
  }, [tab])

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
      <TabsList>
        <TabsTrigger value="accessory">악세사리</TabsTrigger>
        <TabsTrigger value="border">테두리</TabsTrigger>
        <TabsTrigger value="title">칭호</TabsTrigger>
        <TabsTrigger value="nickname">닉네임</TabsTrigger>
      </TabsList>

      <TabsContent value={tab}>
        <div className="custom-scroll mt-30 grid max-h-800 grid-cols-4 gap-30 overflow-x-hidden overflow-y-auto">
          {items.map((item) => (
            <TabContentDetail
              key={item.id}
              item={item}
              onClickPreview={() => onSelectPreview(item)}
              onPurchased={onPurchased}
            />
          ))}
        </div>
        {loading && (
          <div className="mt-10 text-sm text-gray-500">불러오는 중...</div>
        )}
      </TabsContent>
    </Tabs>
  )
}

export default MenuTab
