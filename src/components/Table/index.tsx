import styled from 'styled-components'

const Table = styled.table`
  border-spacing: 0px;
  width: 100%;
  border-collapse: separate;

  thead tr {
    background: ${({ theme }) => theme.bg5};
  }

  thead td {
    padding: 8px;
    border-width: 0 0 4px;
    border-color: ${({ theme }) => theme.bg2};
    border-style: solid;

    & > * {
      width: fit-content;
    }
  }

  tbody td {
    padding: 8px;
  }
`

export default Table
