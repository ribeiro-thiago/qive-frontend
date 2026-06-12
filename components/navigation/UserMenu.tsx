'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, User, Store, Grid2X2, Lock } from 'lucide-react'

interface UserMenuProps {
  userEmail?: string
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const router = useRouter()

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'Q'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          type="button" 
          aria-label="Conta" 
          className="nav-icon-btn"
        >
          <span 
            className="inline-flex items-center justify-center flex-shrink-0 select-none"
            style={{
              width: '24px',
              height: '24px',
              padding: '1px',
              flexDirection: 'column',
              gap: '8px',
              borderRadius: '40px',
              background: '#ABBCFC',
              color: 'rgba(4, 14, 35, 0.64)',
              fontFamily: 'Inter',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '16px',
              fontFeatureSettings: "'liga' off, 'clig' off",
            }}
          >
            {initial}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Conta principal</span>
            {userEmail && (
              <span className="text-xs text-[#5B616F] font-normal">{userEmail}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/minha-conta')}>
          <Building2 className="mr-2 h-4 w-4" />
          <span>Minha conta</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Meu perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Store className="mr-2 h-4 w-4" />
          <span>Loja de aplicativos</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Grid2X2 className="mr-2 h-4 w-4" />
          <span>Gerenciar aplicativos</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/ajustes')}>
          <Lock className="mr-2 h-4 w-4" />
          <span>Módulo de segurança</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
