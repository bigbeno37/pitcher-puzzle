import type { Component } from 'solid-js';
import { createEffect, createMemo, createSignal, For, JSX, Show } from 'solid-js';
import clsx from 'clsx';

type Pitcher = {
	size: number,
	contents: number,
};

const pitcher = (size: number, contents: number): Pitcher => ({
	size,
	contents
});

const PUZZLES = [
	{
		name: 'Medium',
		goal: [4, 4, 0],
		initialConfiguration: [
			pitcher(8, 8),
			pitcher(5, 0),
			pitcher(3, 0)
		]
	},
	{
		name: 'Tough',
		goal: [5, 5, 0],
		initialConfiguration: [
			pitcher(10, 10),
			pitcher(7, 0),
			pitcher(3, 0)
		]
	}
];

const TransferButton: Component<{ onClick?: () => void, children?: JSX.Element }> = ({ onClick, children }) => {
	return <button class="text-4xl" onClick={onClick}>
		{children}
	</button>
};

const App: Component = () => {
	const [currentPuzzleName, setCurrentPuzzleName] = createSignal(PUZZLES[0].name);
	const currentPuzzle = createMemo(() => PUZZLES.find(puzzle => puzzle.name === currentPuzzleName()));
	const [pitchers, setPitchers] = createSignal<Pitcher[]>([]);

	createEffect(() => {
		if (!currentPuzzle()) return;

		setPitchers([...currentPuzzle()!.initialConfiguration].map(pitcher => ({ ...pitcher })));
	});

	const handleReset = () => {
		if (!currentPuzzle()) return;

		setPitchers([...currentPuzzle()!.initialConfiguration].map(pitcher => ({ ...pitcher })));
	};

	const maxPitcherSize = createMemo(() => pitchers().reduce((acc, item) => item.size > acc ? item.size : acc, 0));

	const handlePitcherTransfer = (fromIndex: number, toIndex: number) => {
		const from = { ...pitchers()[fromIndex] };
		const to = { ...pitchers()[toIndex] };
		const toEmptySpace = to.size - to.contents;

		if (from.contents === 0 || to.size === to.contents) return;

		if (from.contents === toEmptySpace) {
			to.contents = to.size;
			from.contents = 0;
		}

		else if (from.contents > toEmptySpace) {
			from.contents -= toEmptySpace;
			to.contents = to.size;
		}

		else if (from.contents < toEmptySpace) {
			to.contents += from.contents;
			from.contents = 0;
		}

		let newPitchers = [...pitchers()];
		newPitchers[fromIndex] = from;
		newPitchers[toIndex] = to;

		setPitchers(newPitchers);
	};

	return (
		<div class="h-full flex flex-col p-4 gap-4">
			<div class="flex gap-2">
				<select class="grow w-full h-full border border-gray-500 rounded text-2xl px-2" value={currentPuzzleName()} onChange={e => setCurrentPuzzleName(e.target.value)}>
					<For each={PUZZLES}>
						{puzzle => (
							<option value={puzzle.name}>{puzzle.name}</option>
						)}
					</For>
				</select>
				<button class="text-2xl bg-red-500 text-white border border-red-800 rounded p-4" onClick={handleReset}>Reset</button>
			</div>
			<span class="text-2xl text-bold text-center">Target:</span>
			<div class="grow flex justify-around gap-4">
				<For each={pitchers()}>
					{(pitcher, index) => (
						<div class="w-full h-full flex flex-col justify-between gap-4">
							<span class={clsx("text-center text-4xl", { "text-red-600": pitcher.contents !== currentPuzzle()!.goal[index()], "text-green-600": pitcher.contents === currentPuzzle()!.goal[index()] })}>{currentPuzzle()!.goal[index()]}</span>
							<div class="w-full" style={{ height: `${(pitcher.size/maxPitcherSize()) * 100}%` }}>
								<div class="flex flex-col h-full w-full gap-2">
									<div class="grow bg-transparent border-black border-4 border-t-0 h-full flex items-end">
										<div class="bg-blue-500 w-full" style={{ height: `${(pitcher.contents/pitcher.size) * 100}%` }}></div>
									</div>
									<div class="grid grid-cols-3 items-center">
										<Show keyed when={index() > 0} fallback={<div />}>
											<TransferButton onClick={() => handlePitcherTransfer(index(), index() - 1)}>{"<"}</TransferButton>
										</Show>
										<span class="text-2xl text-center">{pitcher.contents}</span>
										<Show keyed when={index() < pitchers().length - 1} fallback={<div />}>
											<TransferButton onClick={() => handlePitcherTransfer(index(), index() + 1)}>{">"}</TransferButton>
										</Show>
									</div>
								</div>
							</div>
						</div>
					)}
				</For>
			</div>
		</div>
	);
};

export default App;
