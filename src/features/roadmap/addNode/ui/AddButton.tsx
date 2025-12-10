import { AccentButton } from '@/shared/ui/button'
import { useAddNode } from '../model'

const AddButton = () => {
  const { add } = useAddNode()
  return <AccentButton onClick={add}>Add</AccentButton>
}

export default AddButton
