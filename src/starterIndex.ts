import { App, ItemView, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import DiceRoller from "./ui/DiceRoller.svelte";

const VIEW_TYPE = "svelte-view";

interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
};

class MySvelteView extends ItemView {
    private component: DiceRoller | null = null;
    
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }
    
    getViewType(): string {
        return VIEW_TYPE;
    }
    
    getDisplayText(): string {
        return "Dice Roller";
    }
    
    getIcon(): string {
        return "dice";
    }
    
    async onOpen(): Promise<void> {
        this.component = new DiceRoller({ target: this.contentEl, props: {} });
    }
    
    async onClose(): Promise<void> {
        this.component?.$destroy();
        this.component = null;
    }
}

export default class MyPlugin extends Plugin {
    private view: MySvelteView | null = null;
    settings: MyPluginSettings = DEFAULT_SETTINGS;
    
    async onload() {
        await this.loadSettings();
        
        this.registerView(
                VIEW_TYPE,
                (leaf: WorkspaceLeaf) => (this.view = new MySvelteView(leaf))
        );
        
        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
        
        this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => this.openMapView());
        
        this.addCommand({
            id: 'open-sample-modal-simple',
            name: 'Open sample modal (simple)',
            callback: () => this.openMapView(),
        });
        
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }
    
    async onLayoutReady() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        if (leaves.length > 0) return;
        
        const rightLeaf = this.app.workspace.getRightLeaf(false);
        if (rightLeaf) {
            await rightLeaf.setViewState({ type: VIEW_TYPE });
            this.app.workspace.revealLeaf(rightLeaf); // відкриває праву панель
        }
    }
    
    onunload() {
        // Якщо потрібно, можна очистити ресурси
    }
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    async openMapView() {
        const workspace = this.app.workspace;
        workspace.detachLeavesOfType(VIEW_TYPE);
        
        // @ts-ignore
        const leaf = workspace.getLeaf(!Platform.isMobile);
        await leaf.setViewState({ type: VIEW_TYPE });
        workspace.revealLeaf(leaf);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;
    
    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    
    display(): void {
        const { containerEl } = this;
        
        containerEl.empty();
        
        containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });
        
        new Setting(containerEl)
        .setName('Setting #1')
        .setDesc('It\'s a secret')
        .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue(this.plugin.settings.mySetting)
        .onChange(async (value) => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
        }));
    }
}
