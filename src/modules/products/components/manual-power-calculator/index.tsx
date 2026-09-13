'use client'

import { useState } from 'react'
import { Text } from '@modules/common/components/text'
import { Button } from '@modules/common/components/button'

type CalculationResult = {
    totalPower: number
    suggestedPSU: number
} | null

const ManualPowerCalculator = () => {
    const [powerPerMeter, setPowerPerMeter] = useState<string>('')
    const [length, setLength] = useState<string>('')
    const [result, setResult] = useState<CalculationResult>(null)
    const [error, setError] = useState<string>('')

    const handleCalculate = () => {
        setError('')
        const wpm = parseFloat(powerPerMeter)
        const len = parseFloat(length)

        if (isNaN(wpm) || isNaN(len) || wpm <= 0 || len <= 0) {
            setError('Veuillez entrer des valeurs valides (nombres positifs).')
            return
        }

        const totalPower = wpm * len
        const suggestedPSU = totalPower * 1.2 // Adding 20% safety margin

        setResult({
            totalPower: parseFloat(totalPower.toFixed(2)),
            suggestedPSU: parseFloat(suggestedPSU.toFixed(2)),
        })
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700">
                <Text className="text-sm text-gray-600 mb-4 dark:text-gray-300">
                    Entrez la puissance de votre ruban et la longueur souhaitée pour calculer l&apos;alimentation recommandée.
                </Text>

                <div className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="wpm" className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            Puissance (W/m)
                        </label>
                        <input
                            id="wpm"
                            type="number"
                            placeholder="ex: 14.4"
                            value={powerPerMeter}
                            onChange={(e) => setPowerPerMeter(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:bg-zinc-900 dark:border-zinc-600 dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="length" className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            Longueur totale (m)
                        </label>
                        <input
                            id="length"
                            type="number"
                            placeholder="ex: 5"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:bg-zinc-900 dark:border-zinc-600 dark:text-white"
                        />
                    </div>

                    {error && <Text className="text-xs text-red-500">{error}</Text>}

                    <Button
                        onClick={handleCalculate}
                        className="w-full mt-2"
                    >
                        Calculer
                    </Button>
                </div>
            </div>

            {result && (
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 mb-3 dark:text-blue-100">Résultats</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-blue-200 dark:border-blue-800">
                            <span className="text-sm text-blue-800 dark:text-blue-200">Consommation Totale</span>
                            <span className="font-bold text-blue-900 dark:text-blue-100">{result.totalPower} W</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Alimentation Recommandée</span>
                            <span className="font-bold text-lg text-blue-600 dark:text-blue-300">{Math.ceil(result.suggestedPSU)} W</span>
                        </div>
                        <Text className="text-[10px] text-blue-600/80 mt-1 dark:text-blue-300/60">
                            * Incluant une marge de sécurité de +20%
                        </Text>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManualPowerCalculator
