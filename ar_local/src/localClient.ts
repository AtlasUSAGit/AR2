export type Observer = { next: (data: { items: any[] }) => void; error: (err: any) => void };

class LocalClient {
  private get items() {
    return JSON.parse(localStorage.getItem('AppElements') || '[]');
  }
  
  private set items(newItems: any[]) {
    localStorage.setItem('AppElements', JSON.stringify(newItems));
    this.notify();
  }
  
  private observers: Observer[] = [];

  models = {
    AppElement: {
      create: async (data: any) => {
        const newItems = [...this.items, data];
        this.items = newItems;
        return { data };
      },
      update: async (data: any) => {
        const newItems = this.items.map((item: any) => item.id === data.id ? { ...item, ...data } : item);
        this.items = newItems;
        return { data };
      },
      delete: async (data: any) => {
        const newItems = this.items.filter((item: any) => item.id !== data.id);
        this.items = newItems;
        return { data };
      },
      list: async (query?: any) => {
        let filteredItems = this.items;
        if (query?.filter?.type?.eq) {
            filteredItems = filteredItems.filter((item: any) => item.type === query.filter.type.eq);
        }
        return { data: filteredItems };
      },
      observeQuery: () => {
        return {
          subscribe: (observer: Observer) => {
            this.observers.push(observer);
            observer.next({ items: this.items });
            return {
              unsubscribe: () => {
                this.observers = this.observers.filter(obs => obs !== observer);
              }
            };
          }
        };
      }
    }
  };

  private notify() {
    const currentItems = this.items;
    this.observers.forEach(obs => obs.next({ items: currentItems }));
  }
}

export const generateClient = () => new LocalClient() as any;
