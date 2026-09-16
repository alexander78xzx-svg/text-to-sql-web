import { useState } from 'react'
import './App.css'

export default function App() {
  const [isOpenAddTable, setIsOpenAddTable] = useState(false)
  const [tables, setTables] = useState([])

  const [tableName, setTableName] = useState('')
  const [columnsInput, setColumnsInput] = useState('')
  const [pkInput, setPkInput] = useState('')

  const handleSaveTable = () => {
    if (!tableName.trim()) return

    const newTable = {
      name: tableName.trim(),
      columns: columnsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      primary_keys: pkInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    }

    setTables([...tables, newTable])
    setTableName('')
    setColumnsInput('')
    setPkInput('')
    setIsOpenAddTable(false)
  }

  const [isOpenAddFK, setIsOpenAddFK] = useState(false)
  const [foreignKeys, setForeignKeys] = useState([])

  const [sourceTable, setSourceTable] = useState('')
  const [sourceColumn, setSourceColumn] = useState('')
  const [targetTable, setTargetTable] = useState('')
  const [targetColumn, setTargetColumn] = useState('')

  const handleSaveFK = () => {
    if (!sourceTable.trim() || !sourceColumn.trim() || !targetTable.trim() || !targetColumn.trim()) {
      return
    }

    const newFK = {
      source_table: sourceTable.trim(),
      source_column: sourceColumn.trim(),
      target_table: targetTable.trim(),
      target_column: targetColumn.trim(),
    }

    setForeignKeys([...foreignKeys, newFK])

    setSourceTable('')
    setSourceColumn('')
    setTargetTable('')
    setTargetColumn('')
    setIsOpenAddFK(false)
  }
  
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [isOpenMenu, setIsOpenMenu] = useState(false)

  const handleSelectPreset = (presetKey) => {
    const selected = PRESETS[presetKey]
    if (!selected) return

    setTables(selected.tables)
    setForeignKeys(selected.foreignKeys)
    setQuestion(selected.question)
    setIsOpenMenu(false)
  }

  const handleGenerate = async () => {
    if (!question.trim()) {
      setError('You must ask a question.')
      return
    }
    if (tables.length === 0) {
      setError('You must define at least one table.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const schemaPayload = JSON.stringify({
      tables: tables,
      foreign_keys: foreignKeys,
    })

    try {
      const response = await fetch('https://mazoner11-text-to-sql-backend.hf.space/call/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            question.trim(),
            schemaPayload
          ]
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`)
      }

      const { event_id } = await response.json()

      const eventSource = new EventSource(`https://mazoner11-text-to-sql-backend.hf.space/call/generate/${event_id}`)

      eventSource.addEventListener('complete', (event) => {
        const data = JSON.parse(event.data)
        setResult(data[0]) 
        eventSource.close()
        setLoading(false)
      })

      eventSource.addEventListener('error', () => {
        setError('Inference failed or queue disconnected.')
        eventSource.close()
        setLoading(false)
      })

    } catch (err) {
      setError(err.message || 'Failed to connect to the backend.')
      setLoading(false)
    }
  }

  const PRESETS = {
    flight: {
      name: "Flights",
      question: "Find the airport code and airport name of the airport with code 'APG'.",
      tables: [
        {
          name: "airports",
          columns: [
            "City",
            "AirportCode",
            "AirportName",
            "Country",
            "CountryAbbrev"
          ],
          primary_keys: ["AirportCode"]
        },
        {
          name: "flights",
          columns: [
            "Airline",
            "FlightNo",
            "SourceAirport",
            "DestAirport"
          ],
          primary_keys: ["FlightNo"]
        }
      ],
      foreignKeys: [
        {
          source_table: "flights",
          source_column: "SourceAirport",
          target_table: "airports",
          target_column: "AirportCode"
        },
        {
          source_table: "flights",
          source_column: "DestAirport",
          target_table: "airports",
          target_column: "AirportCode"
        }
      ]
    },
    battle_death: {
      name: "Battle Death",
      question: "List the name and tonnage ordered by in descending alphaetical order for the names.",
      tables: [
        {
          name: "battle",
          columns: [
            "id",
            "name",
            "date",
            "bulgarian_commander",
            "latin_commander",
            "result"
          ],
          primary_keys: ["id"]
        },
        {
          name: "ship",
          columns: [
            "lost_in_battle",
            "id",
            "name",
            "tonnage",
            "ship_type",
            "location",
            "disposition_of_ship"
          ],
          primary_keys: ["id"]
        },
        {
          name: "death",
          columns: [
            "caused_by_ship_id",
            "id",
            "note",
            "killed",
            "injured"
          ],
          primary_keys: ["id"]
        }
      ],
      foreignKeys: [
        {
          source_table: "ship",
          source_column: "lost_in_battle",
          target_table: "battle",
          target_column: "id"
        },
        {
          source_table: "death",
          source_column: "caused_by_ship_id",
          target_table: "ship",
          target_column: "id"
        }
      ]
    },
    voter: {
      name: "Voter 1",
      question: "List the vote ids, phone numbers and states of all votes.",
      tables: [
        {
          name: "AREA_CODE_STATE",
          columns: ["area_code", "state"],
          primary_keys: ["area_code"]
        },
        {
          name: "CONTESTANTS",
          columns: ["contestant_number", "contestant_name"],
          primary_keys: ["contestant_number"]
        },
        {
          name: "VOTES",
          columns: [
            "vote_id",
            "phone_number",
            "state",
            "contestant_number",
            "created"
          ],
          primary_keys: ["vote_id"]
        }
      ],
      foreignKeys: [
        {
          source_table: "VOTES",
          source_column: "contestant_number",
          target_table: "CONTESTANTS",
          target_column: "contestant_number"
        },
        {
          source_table: "VOTES",
          source_column: "state",
          target_table: "AREA_CODE_STATE",
          target_column: "state"
        }
      ]
    },
    museum_visit: {
      name: "Museum Visit",
      question: "How many visitors below age 30 are there?",
      tables: [
        {
          name: "museum",
          columns: [
            "Museum_ID",
            "Name",
            "Num_of_Staff",
            "Open_Year"
          ],
          primary_keys: ["Museum_ID"]
        },
        {
          name: "visitor",
          columns: [
            "ID",
            "Name",
            "Level_of_membership",
            "Age"
          ],
          primary_keys: ["ID"]
        },
        {
          name: "visit",
          columns: [
            "Museum_ID",
            "visitor_ID",
            "Num_of_Ticket",
            "Total_spent"
          ],
          primary_keys: ["Museum_ID"]
        }
      ],
      foreignKeys: [
        {
          source_table: "visit",
          source_column: "visitor_ID",
          target_table: "visitor",
          target_column: "ID"
        },
        {
          source_table: "visit",
          source_column: "Museum_ID",
          target_table: "museum",
          target_column: "Museum_ID"
        }
      ]
    },
    network: {
      name: "Network 1",
      question: "How many high schoolers are there?",
      tables: [
        {
          name: "Highschooler",
          columns: ["ID", "name", "grade"],
          primary_keys: ["ID"]
        },
        {
          name: "Friend",
          columns: ["student_id", "friend_id"],
          primary_keys: ["student_id"]
        },
        {
          name: "Likes",
          columns: ["student_id", "liked_id"],
          primary_keys: ["student_id"]
        }
      ],
      foreignKeys: [
        {
          source_table: "Friend",
          source_column: "friend_id",
          target_table: "Highschooler",
          target_column: "ID"
        },
        {
          source_table: "Friend",
          source_column: "student_id",
          target_table: "Highschooler",
          target_column: "ID"
        },
        {
          source_table: "Likes",
          source_column: "student_id",
          target_table: "Highschooler",
          target_column: "ID"
        },
        {
          source_table: "Likes",
          source_column: "liked_id",
          target_table: "Highschooler",
          target_column: "ID"
        }
      ]
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="flex items-center justify-between mb-6 w-full max-w-4xl border-b border-black/10 py-2">

          <div className="w-36 flex justify-start relative ">
            <button
              type="button"
              onClick={() => setIsOpenMenu((prev) => !prev)}
              className="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1 rounded-lg shadow-xs cursor-pointer transition flex justify-center items-center gap-1.5"
            >
              <span>Templates</span>
              <span className="text-[18px] text-slate-400">▾</span>
            </button>


            {isOpenMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-black/10 rounded-xl shadow-lg z-30 p-1 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('flight')}
                  className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                >
                  Flights
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('battle_death')}
                  className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                >
                  Battle Death
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('voter')}
                  className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                >
                  Voter 1
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('museum_visit')}
                  className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                >
                  Museum Visit
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('network')}
                  className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                >
                  Network 1
                </button>
              </div>
            )}
          </div>


          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Text to SQL</h1>
          </div>

          {/* Right: GitHub Repo Link (Matches w-36 for perfect symmetry) */}
          <div className="w-36 flex justify-end">
            <a
              href="https://github.com/alexander78xzx-svg/text-to-sql"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition duration-150"
              title="View project on GitHub"
            >
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
          </div>
        </div>


        <div className="flex w-full max-w-4xl gap-6 items-stretch">
          
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium">Add tables :</p>
              <div onClick={() => setIsOpenAddTable(true)} className="bg-slate-200 rounded-lg p-2 flex items-center justify-center cursor-pointer">
                <button>+</button>
              </div>
              {tables.length > 0 && (
                <div className="flex flex-wrap gap-2 my-1">
                  {tables.map((tbl, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-black/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      {tbl.name}
                      <button
                        type="button"
                        onClick={() => setTables(tables.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium">Add foreign keys :</p>
              <div onClick={() => setIsOpenAddFK(true)} className="bg-slate-200 rounded-lg p-2 flex items-center justify-center cursor-pointer">
                <button>+</button>
              </div>

              {foreignKeys.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-1">
                    {foreignKeys.map((fk, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-black/10 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-700 flex items-center gap-1.5"
                      >
                        {fk.source_table}.{fk.source_column} → {fk.target_table}.{fk.target_column}
                        <button
                          type="button"
                          onClick={() => setForeignKeys(foreignKeys.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

            </div>

            <div>
              <p className="text-sm font-medium">Your question :</p>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="border-2 border-black/10 p-3 w-full text-sm rounded-2xl outline-none focus:border-black/30"
                placeholder="Ask something..."
              />
            </div>
            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold rounded-xl duration-300 transition cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          <div className="flex-1 border-2 border-black/10 rounded-2xl p-4 bg-white flex flex-col min-h-[300px]">
            {result ? (
                <div className="flex flex-col gap-3">
                  <pre className=" text-sm whitespace-pre-wrap break-words font-mono overflow-x-auto">
                    {result.output}
                  </pre>

                  {result.compiles ? (
                    <div className="mt-auto pt-1 flex items-center justify-end text-xs">
                      <span className="text-slate-500 font-medium"></span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        ✓ Compiles
                      </span>
                    </div>
                  ) : (
                    <div className="mt-auto pt-1 flex items-center justify-end text-xs">
                      <span className="text-slate-500 font-medium"></span>
                      <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        x Execution Failed
                      </span>
                    </div>
                  )}


                </div>
                
              ) : (
                <p className="text-gray-400 text-sm">Generated SQL will appear here...</p>                
              )}            


          </div>

        </div>


        {isOpenAddFK && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-black/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Add Foreign Key</h2>
                <button
                  type="button"
                  onClick={() => setIsOpenAddFK(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Source Table
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. management"
                      value={sourceTable}
                      onChange={(e) => setSourceTable(e.target.value)}
                      className="w-full border border-black/15 rounded-xl p-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Source Column
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. department_id"
                      value={sourceColumn}
                      onChange={(e) => setSourceColumn(e.target.value)}
                      className="w-full border border-black/15 rounded-xl p-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Target Table
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. department"
                      value={targetTable}
                      onChange={(e) => setTargetTable(e.target.value)}
                      className="w-full border border-black/15 rounded-xl p-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Target Column
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. department_id"
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value)}
                      className="w-full border border-black/15 rounded-xl p-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenAddFK(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFK}
                  className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl cursor-pointer transition"
                >
                  Save Foreign Key
                </button>
              </div>
            </div>
          </div>
        )}

        {isOpenAddTable && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-black/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Add Table Schema</h2>
                <button
                  onClick={() => setIsOpenAddTable(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Table Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. department"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full border border-black/15 rounded-xl p-2 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Columns (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. department_id, name, ranking"
                    value={columnsInput}
                    onChange={(e) => setColumnsInput(e.target.value)}
                    className="w-full border border-black/15 rounded-xl p-2 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Primary Key(s)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. department_id"
                    value={pkInput}
                    onChange={(e) => setPkInput(e.target.value)}
                    className="w-full border border-black/15 rounded-xl p-2 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsOpenAddTable(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTable}
                  className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl cursor-pointer transition"
                >
                  Save Table
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}