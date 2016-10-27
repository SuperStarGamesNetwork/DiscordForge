const DiscordJS = require('discord.js');
const Command = require('./Command');

/** Custom guild class
 * @extends {DiscordJS.Guild}
 */
class guild extends DiscordJS.Guild {
  constructor(client, data) {
    super(client, data);


    this._commands = new DiscordJS.Collection();

    if (!data) return;
    if (data.unavailable) {
      /**
       * Whether the Guild is available to access. If it is not available, it indicates a server outage.
       * @type {boolean}
       */
      this.available = false;

      /**
       * The Unique ID of the Guild, useful for comparisons.
       * @type {string}
       */
      this.id = data.id;
    } else {
      this.available = true;
      this.setup(data);
    }
  }

  setup(data) {
    super.setup(data);

    if (data.commands) {
      data.commands.forEach(command => {
        this.registerCommand(new Command(command.title, command.message, this));
      });
    }
    this._prefix = data.prefix || this.client.defaults.prefix;
  }
  /**
   * Registers a command to the guild
   * @param {Command} command The command to register
   */
  registerCommand(command) {
    if (command instanceof Command && !this._commands.has(command.id)) {
      this._commands.set(command.id, command);
    }
  }
  /**
   * Removes a command from the guild
   * @param {Command} command The command to remove
   */
  removeCommand(command) {
    if ((command instanceof Command) && this._commands.has(command.id)) {
      this._commands.delete(command.id);
    }
  }
  /**
   * Enables a plugin
   * @param {string} plugin the id of the plugin to disable
   */
  enablePlugin(plugin) {
    if (plugin !== undefined && typeof plugin === 'string' && this.enabledPlugins.indexOf(plugin) === -1) {
      this.client.emit('debug', `Enabling plugin: ${plugin}`);
      this.enabledPlugins.push(plugin);
    }
  }
  /**
   * Disables a plugin
   * @param {string} plugin the id of the plugin to disable
   */
  disablePlugin(plugin) {
    if (plugin !== undefined && typeof plugin === 'string' && this.enabledPlugins.indexOf(plugin) !== -1) {
      this.client.emit('debug', `Disabling plugin: ${plugin}`);
      const pos = this.enabledPlugins.indexOf(plugin);
      this.enabledPlugins.splice(pos, 1);
    }
  }

  _setPrefix(Prefix) {
    this._prefix = Prefix;
  }

  changePrefix(Prefix) {
    if (Prefix !== null && typeof Prefix === 'string') {
      this._setPrefix(Prefix);
    }
  }

  get prefix() {
    return this._prefix;
  }

  get commands() {
    return this._commands;
  }
}

module.exports = guild;
