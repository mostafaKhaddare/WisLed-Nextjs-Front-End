'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkMini } from '@medusajs/icons'
import { Text } from '@modules/common/components/text'

type ColorGuideModalProps = {
    isOpen: boolean
    close: () => void
}

const ColorGuideModal = ({ isOpen, close }: ColorGuideModalProps) => {
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900 flex flex-col max-h-[80vh]">
                                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                    >
                                        Guide des Températures
                                    </Dialog.Title>
                                    <button
                                        onClick={close}
                                        className="text-gray-400 hover:text-gray-500 outline-none p-1"
                                    >
                                        <XMarkMini />
                                    </button>
                                </div>

                                <div className="mt-2 space-y-6 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                    <Text className="text-gray-500 text-sm">
                                        La température de couleur détermine l&apos;ambiance de votre pièce. Voici comment choisir :
                                    </Text>

                                    {/* 2700K - Warm White */}
                                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors border border-orange-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full shadow-sm flex items-center justify-center text-[10px] font-bold text-white shadow-orange-200"
                                                style={{ background: 'linear-gradient(135deg, #ff9d6c 0%, #ffc58f 100%)' }}>
                                                2700K
                                            </div>
                                            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">Blanc Chaud</h4>
                                        </div>
                                        <div className="space-y-2 pl-1">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Description</span>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">
                                                    Une lumière douce et dorée rappelant les ampoules traditionnelles. Elle crée une atmosphère chaleureuse, intime et apaisante.
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Applications Idéales</span>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">
                                                    Salons, chambres à coucher, coins lecture, restaurants et espaces lounge.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4000K - Natural White */}
                                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 transition-colors border border-yellow-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-800 shadow-yellow-200"
                                                style={{ background: 'linear-gradient(135deg, #ffe4b5 0%, #fffacd 100%)' }}>
                                                4000K
                                            </div>
                                            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">Blanc Naturel</h4>
                                        </div>
                                        <div className="space-y-2 pl-1">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">Description</span>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">
                                                    Une lumière blanche neutre, sans dominante jaune ni bleue. C&apos;est l&apos;équilibre parfait entre confort visuel et clarté, reproduisant la lumière du jour.
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">Applications Idéales</span>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">
                                                    Cuisines, salles de bains, bureaux, dressings, plans de travail et magasins.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6000K - Cool White */}
                                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors border border-blue-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-800 shadow-blue-200"
                                                style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)', border: '1px solid #e2e8f0' }}>
                                                6000K
                                            </div>
                                            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">Blanc Froid</h4>
                                        </div>
                                        <div className="space-y-2 pl-1">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Description</span>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">
                                                    Une lumière intense et stimulante avec une légère teinte bleutée. Elle offre un contraste maximal et favorise la concentration.
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Applications Idéales</span>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">
                                                    Garages, ateliers, zones techniques, hôpitaux, vitrines modernes et éclairage de sécurité.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex-shrink-0 pt-4 border-t border-gray-100">
                                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-[#ff9d6c] via-[#fffacd] to-[#e0f7fa]" />
                                    <div className="flex justify-between text-[9px] text-gray-400 mt-2 uppercase tracking-wide font-medium">
                                        <span>Chaud</span>
                                        <span>Neutre</span>
                                        <span>Froid</span>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default ColorGuideModal
