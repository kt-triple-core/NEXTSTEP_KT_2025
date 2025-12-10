import { AddingPositionType } from '../model/types'

interface AddingPositionButtonProps {
  addingPosition: AddingPositionType
  position: AddingPositionType
  handleClick: (position: AddingPositionType) => void
}

const AddingPositionButton = ({
  addingPosition,
  position,
  handleClick,
}: AddingPositionButtonProps) => {
  return (
    <button
      className={`${
        position === addingPosition && 'bg-accent'
      } rounded-sm px-5 hover:cursor-pointer`}
      onClick={() => handleClick(position)}
    >
      {position}
    </button>
  )
}

export default AddingPositionButton
