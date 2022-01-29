<template>
  <v-container>
    <div class="text-h4 pb-4 pt-2">{{ property }}</div>
    <div class="kanban-container">
      <div
        v-for="(mappedItem, index) in mappedData"
        :key="index"
        class="kanban-list mx-2 pa-2"
        :class="{'is-target': currentDragTarget === mappedItem.title}"
        @dragenter="currentDragTarget = mappedItem.title"
      >
        <div
          slot="header"
          role="group"
          class="text-h5 pb-2"
        >
          {{ mappedItem.title }}
        </div>
        <draggable
          :list="mappedItem.data"
          :group="property"
          v-bind="dragOptions"
          :sort="false"
          @change="onChange($event, mappedItem.title)"
          @end="currentDragTarget = ''"
        >
          <v-card
            v-for="(item, index) in mappedItem.data"
            :key="index"
            class="mb-2"
          >
            <v-card-title>
              {{ item.name }}
            </v-card-title>
          </v-card>
        </draggable>
        <div
          class="add-button-container py-2"
        >
          <img
            :src="require('@/assets/add-icon.svg')"
            class="add-button"
            @click="onAddClick(mappedItem)"
          />
        </div>
      </div>
    </div>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Add Item</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newItem.name"
            label="Name"
            type="text"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            :disabled="!newItem.name"
            text
            @click="onAddConfirm"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import {
  Component,
  Inject,
  Vue,
} from 'vue-property-decorator';
import draggable from 'vuedraggable'
import { v4 as uuidv4 } from 'uuid';
import { 
  DataService,
  DATA_SERVICE_SYMBOL,
} from '@/services/DataService';
import { Data } from '@/models/data';

interface MappedData {
  [teamName: string]: Data[],
}

interface MappedDataItem {
  title: string,
  data: Data[],
}

@Component({
  components: {
    draggable,
  }
})
export default class KanbanComponent extends Vue {
  @Inject(DATA_SERVICE_SYMBOL) private dataService!: DataService;
  // This property would ideally be configured on the kanban so that it can display different attributes of the data
  private property: string = 'Team';
  private rawData: Data[] = [];
  private mappedData: MappedDataItem[] = [];
  private currentDragTarget: string = '';
  private newItem: Data = {
    id: uuidv4(),
    name: '',
  }
  private dialog: boolean = false;
  private dragOptions = {
    animation: 100,
    disabled: false,
    ghostClass: "ghost"
  };

  public async mounted(): Promise<void> {
    await this.fetchData();
  }

  private async fetchData(): Promise<void> {
    this.rawData = await this.dataService.getData();
    this.mapData();
  }

  private mapData(): void {
    this.mappedData = [];
    const data: MappedData = {};
    this.rawData.forEach((dataItem: Data) => {
      if (!dataItem[this.property.toLowerCase()]) {
        return;
      }
      // There would probably be some extra mapping here to account for different property types such numbers/booleans/etc
      const value: string = dataItem[this.property.toLowerCase()] as string;
      if (!data[value]) {
        data[value] = [dataItem];
        return;
      }
      data[value].push(dataItem);
    });
    Object.keys(data).forEach((title: string) => {
      this.mappedData.push({
        title,
        data: data[title],
      });
    });
  }

  private async onChange(event: any, value: string): Promise<void> {
    if (event.added) {
      const data: Data = event.added.element as Data;
      data[this.property.toLowerCase()] = value;
      await this.dataService.updateElement(data);
      await this.fetchData();
    }
  }

  private onAddClick(item: MappedDataItem): void {
    this.newItem = {
      id: uuidv4(),
      name: '',
    }
    this.newItem[this.property.toLowerCase()] = item.title;
    this.dialog = true;
  }

  private async onAddConfirm(): Promise<void> {
    await this.dataService.addElement(this.newItem);
    await this.fetchData();
    this.dialog = false;
  }

  private onDragEnter(title: string): void {
    this.currentDragTarget = title;
  }
}
</script>

<style lang="scss" scoped>
.kanban-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  .kanban-list {
    flex-grow: 1;
    flex-basis: 0;
    min-width: 200px;
    min-height: 20px;
    background: rgb(238, 238, 238);
    border-radius: 10px;
    border: 1px solid rgb(200, 200, 200);

    &.is-target {
      border: 1px solid #a414f7;
    }

    .add-button-container {
      display: flex;
      justify-content: space-around;

      .add-button {
        height: 40px;
        cursor: pointer;
      }
    }
  }
}
</style>
