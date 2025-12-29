import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  safelist: [
    'bg-[#DBCFFF]',
    'bg-[#C1F0C1]',
    'bg-[#eddaa2]',
    'bg-[#ffcff6]',
    'bg-[#c1c1c1]',
    'bg-[#ffc4c4]',
    'bg-[#c4d3ff]',
    'bg-[#ffe6cf]',
    'bg-[#cffff2]',
    'from-[#a250d3]',
    'to-[#30cdb9]',
    'text-[#10B710]',
    'text-[#7158bd]',
    'text-[#bf782c]',
    'text-[#ff00cf]',
    'text-[#4d4d4d]',
    'text-[#d51b1b]',
    'text-[#1b1fd5]',
    'text-[#bd8358]',
    'text-[#4d9ca5]',
    'text-[#fafbfc]',
  ],
}

export default config
