// types inspired by https://wanago.io/2020/03/09/functional-react-components-with-generic-props-in-typescript/

export type Header<ObjectType> = {
  key: keyof ObjectType
  label: string
  width: string
}

interface TableProps<ObjectType> {
  items: ObjectType[]
  headers: Header<ObjectType>[]
  className?: string
}

export default function AppTable<T extends { id: number }>({
  items,
  headers,
  className,
}: TableProps<T>) {
  return (
    <>
      <div className={`fr-table ${className}`}>
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
