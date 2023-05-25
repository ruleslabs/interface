type SVGProps = React.SVGProps<SVGSVGElement>

export const Search = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" {...props}>
    <line x1="15" y1="15" x2="9.5" y2="9.5" strokeLinecap="round" strokeWidth="2" stroke="currentColor" />
    <path
      d="M6,11A5,5,0,0,1,1,6,5,5,0,0,1,6,1a5,5,0,0,1,5,5,5,5,0,0,1-5,5"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
    />
  </svg>
)

export const Logo = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1594 1594" {...props}>
    <path
      fill="currentColor"
      d="M767,1221.5h614c117.6-.1,212.9-95.4,213-213v-636H1387v642H710v-114H877c119.3-1,215.5-97.7,216-217v-47c.1-145.7-117.8-263.9-263.5-264H222C99.4,372.6.1,471.9,0,594.5v627H207v-643H887v114H720c-119.7-.1-216.9,96.9-217,216.6h0v47.4C502.8,1102.6,620.9,1221.2,767,1221.5Z"
    />
  </svg>
)

export const Close = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
    <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    <line x1="3.2" y1="2.8" x2="12.8" y2="13.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
)

export const Starknet = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" {...props}>
    <path d="M20.5,20.9,17,31.4a1.1,1.1,0,0,1-1.5.5,1.2,1.2,0,0,1-.5-.5L11.5,20.9a.8.8,0,0,0-.4-.4L.6,17a1.1,1.1,0,0,1-.5-1.5L.6,15l10.5-3.5a.8.8,0,0,0,.4-.4L15,.6A1.1,1.1,0,0,1,16.5.1l.5.5,3.5,10.5.4.4L31.4,15a1.1,1.1,0,0,1,.5,1.5,1.2,1.2,0,0,1-.5.5L20.9,20.5Z" />
  </svg>
)

export const Ethereum = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" {...props}>
    <path d="M25.8,16.3,16,0h0L6.2,16.3,16,22.1h0ZM15.2,20.8,7.2,16l8-13.2Z" />
    <path d="M25.8,18.2,16,24,6.2,18.2,16,32m-.8-2.4L8.9,20.7l6.3,3.7Z" />
  </svg>
)

export const CreditCard = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22,4H2A2,2,0,0,0,0,6V18a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V6A2,2,0,0,0,22,4ZM3,8A1.1,1.1,0,0,1,4,7H8A1.1,1.1,0,0,1,9,8v2a1.1,1.1,0,0,1-1,1H4a1.1,1.1,0,0,1-1-1Zm2.9,9H4a1,1,0,0,1,0-2H5.9a1,1,0,0,1,0,2Zm4.7,0H8.7a1,1,0,1,1,0-2h1.9a1,1,0,1,1,0,2Zm4.7,0H13.4a1,1,0,1,1,0-2h1.9a1,1,0,0,1,0,2ZM20,17H18.1a1,1,0,0,1,0-2H20a1,1,0,0,1,0,2Z" />
  </svg>
)

export const Discord = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" {...props}>
    <path d="M216.9,45.5A210.3,210.3,0,0,0,164,28.9c-2.2,4.1-4.9,9.7-6.7,14.1a191.9,191.9,0,0,0-58.6,0,140.8,140.8,0,0,0-6.8-14.1A207.8,207.8,0,0,0,39,45.6C5.6,96.1-3.4,145.3,1.1,193.9a212.4,212.4,0,0,0,64.8,33.2,159.9,159.9,0,0,0,13.8-22.9,141.6,141.6,0,0,1-21.8-10.6c1.8-1.4,3.6-2.8,5.3-4.3,42.2,19.7,87.9,19.7,129.6,0,1.7,1.5,3.5,2.9,5.3,4.3a130.2,130.2,0,0,1-21.9,10.6,160.5,160.5,0,0,0,13.9,22.9,213.6,213.6,0,0,0,64.8-33.2C260.2,137.6,245.8,88.8,216.9,45.5ZM85.5,164c-12.7,0-23-11.8-23-26.2s10.1-26.2,23-26.2,23.2,11.8,23,26.2S98.3,164,85.5,164Zm85,0c-12.6,0-23-11.8-23-26.2s10.2-26.2,23-26.2,23.3,11.8,23,26.2S183.4,164,170.5,164Z" />
  </svg>
)
