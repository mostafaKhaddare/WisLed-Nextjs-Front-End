'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkMini } from '@medusajs/icons'
import ManualPowerCalculator from '../manual-power-calculator'

type PowerCalculatorModalProps = {
    isOpen: boolean
    close: () => void
}

const PowerCalculatorModal = ({ isOpen, close }: PowerCalculatorModalProps) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[75]" onClose={close}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-opacity-75 backdrop-blur-md bg-zinc-900/40" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex h-full min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900 flex flex-col max-h-[85vh]">
                                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-x-2"
                                    >
                                        <span>⚡</span> Calculateur d&apos;Alimentation
                                    </Dialog.Title>
                                    <button
                                        onClick={close}
                                        className="text-gray-400 hover:text-gray-500 outline-none p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <XMarkMini />
                                    </button>
                                </div>

                                <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                    <ManualPowerCalculator />
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default PowerCalculatorModal
