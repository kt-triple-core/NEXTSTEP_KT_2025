import { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ModalProps {
  trigger: ReactNode
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void

  // className props
  className?: string
  headerClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  footerClassName?: string
}

const Modal = ({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader className={headerClassName}>
          <DialogTitle className={titleClassName}>{title}</DialogTitle>
          {description && (
            <DialogDescription className={descriptionClassName}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        {footer && (
          <DialogFooter className={footerClassName}>{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
