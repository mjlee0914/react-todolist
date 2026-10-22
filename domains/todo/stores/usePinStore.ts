'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PinStore } from '../types/pin.types';
import type { Todo } from '../types/todo.types';

// 고차함수.
export const usePinStore = create<PinStore>()(
    persist(
        immer((set) => ({
            items: [],
            _hasHydrated: false,
            setHasHydrated: (state: boolean) => {
                set((_state) => {
                    _state._hasHydrated = state;
                });
            },

            add: (item: Todo) => {
                set((state: PinStore) => {
                    // 현재 상태가 매개변수로 정해짐.
                    // 등록 여부 확인
                    const exists = state.items.some(
                        (pin) => pin.id === item.id,
                    );
                    if (!exists) {
                        // 등록이 안되어 있는 경우
                        state.items.push(item);
                    }
                });
            },
            remove: (id: string) => {
                set((state: PinStore) => {
                    const index = state.items.findIndex(
                        (item) => item.id === id,
                    );

                    if (index !== -1) {
                        // -1은 못찾은 경우, 찾은 경우면 제거
                        // immer 사용시엔 원본 데이터를 수정해야 함.
                        state.items.splice(index, 1);
                    }
                });
            },
        })),
        {
            name: 'todo-pin-storage', // local storage key name
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }),
            skipHydration: true,
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true); // hydration 완료
            },
        },
    ),
);
