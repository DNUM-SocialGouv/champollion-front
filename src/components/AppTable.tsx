// types inspired by fromhttps://wanago.io/2020/03/09/functional-react-components-with-generic-props-in-typescript/

interface TableProps<ObjectType> {
  items: ObjectType[]
  headers: {
    key: keyof ObjectType
    label: string
    width: string
  }[]
}

export default function AppTable<T extends { id: number }>({
  items,
  headers,
}: TableProps<T>) {
  return (
    <>
      <div className="fr-table">
        <table className="table-fixed">
          <thead>
            <tr>
              {headers.map(({ key, label, width }) => (
                <th key={`head-col-${String(key)}`} scope="col" style={{ width }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              return (
                <tr key={`row-${item.id}`}>
                  {headers.map(({ key }) => {
                    return (
                      <td key={`row-${item.id}-col-${String(key)}`}>
                        {<>{item[key] ? item[key] : ""}</>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
