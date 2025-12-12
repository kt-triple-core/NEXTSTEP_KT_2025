import { Button } from '@/shared/ui'
import { useAddNode } from '../model'

const AddButton = () => {
  const { add } = useAddNode()
  return (
    <Button variant="accent" onClick={add} className="px-20 py-8">
      Add
    </Button>
  )
}

export default AddButton
