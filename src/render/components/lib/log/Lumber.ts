import { createStore } from "@xstate/store";

export type LumberChannel = {
  name: string,
  level: number;
};

export const CommonLevels = {
  INFO: 0,
  DEBUG: 1,
  WARNING: 2,
  ERROR: 3,
} as const;
export type CommonLevels = typeof CommonLevels[keyof typeof CommonLevels];

export const CommonInfoChannels = {
  RENDER: "render",
  HOOK: "hook",
  LIFECYCLE: "lifecycle"
} as const;
export type CommonInfoChannels = typeof CommonInfoChannels[keyof typeof CommonInfoChannels];

export const CommonChannels = {
  ...CommonInfoChannels
} as const;
export type CommonChannels = typeof CommonChannels[keyof typeof CommonChannels];

const store = createStore({
  context: {
    level: 0,
    filter: /.*/,
    channels: {} as { [key: string]: number; }
  },
  on: {
    setFilter: (context, { filter }: { filter: RegExp; }) => ({ ...context, filter }),
    setLevel: (context, { level }: { level: number; }) => ({ ...context, level }),
    setChannel: (context, event: { level: number; channel: string; }) => ({
      ...context,
      channels: {
        ...context.channels,
        [event.channel]: event.level
      }
    })
  }
});

export const Lumber = {
  createChannel: (channel: string, level: number) => store.trigger.setChannel({ channel, level }),
  blockChannel: (channel: string) => store.trigger.setChannel({ channel, level: -1 }),
  setLevel: (level: number) => store.trigger.setLevel({ level }),
  setFilter: (filter: RegExp) => store.trigger.setFilter({ filter }),
  getLogger: (channel: string) => Lumber.log.bind(Lumber, channel),
  log: (channel: string, ...messages: any[]) => {
    const { context: { filter, channels, level } } = store.get();
    const channelLevel = channels[channel] ?? 0;

    if (channelLevel < 0 || channelLevel < level) return;
    if (!filter.test(channel)) return;

    console.log(...messages);
  },
  ...CommonChannels,
  ...CommonLevels
} as const;

for (const channel in CommonInfoChannels) {
  Lumber.createChannel(channel, 0);
}