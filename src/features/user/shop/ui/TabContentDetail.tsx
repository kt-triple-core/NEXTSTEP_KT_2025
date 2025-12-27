import { Button } from '@/shared/ui'
import { DecorationImage } from './DecorationImage'

type DecorationItem = {
  id: string
  name: string
  price: number
  category: 'accessory' | 'border' | 'title' | 'nickname'
  style: string | null
  source: string | null
}

interface Props {
  item: DecorationItem
}

const TabContentDetail = ({ item }: Props) => {
  const isNickname = item.category === 'nickname'
  const isTitle = item.category === 'title'

  return (
    <div className="flex flex-col items-center rounded-sm border border-[#DBCFFF] bg-[#FAF9FD] p-20">
      {/* 미리보기 영역 */}
      {!isTitle && (
        <div
          className={`relative my-25 h-150 w-150 rounded-full ${
            isNickname ? '' : 'bg-accent'
          }`}
          style={
            isNickname
              ? { backgroundColor: item.source ?? undefined }
              : undefined
          }
        >
          {!isNickname && (
            <DecorationImage
              category={item.category}
              style={item.style as any}
              source={item.source}
            />
          )}
        </div>
      )}

      {/* 텍스트 영역 */}
      <div className="flex flex-col items-center gap-5">
        {isNickname ? (
          <div className="text-lg font-medium">{item.name}</div>
        ) : (
          <>
            <div className={`mt-10 text-lg font-medium ${item.source ?? ''}`}>
              {item.name}
            </div>
          </>
        )}
        <span className="text-md text-gray-500">{item.price}P</span>
      </div>

      <Button variant="accent" className="mt-15 w-full rounded-sm py-10">
        구매하기
      </Button>
    </div>
  )
}

export default TabContentDetail
