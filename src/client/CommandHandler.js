/**
 *  This is the chat handling class file. This is the command running code. Very finiky
 *
 */
class commandHandler {
  constructor(client) {
    this.client = client;
  }

  handleMessage(message, author, channel, guild) {
    if (author.bot) return false;
    if (this.client.options.selfBot === true && author.id !== this.client.user.id) return false;
    if (this.client.options.perGuild === true && channel.type === 'text') return this.perGuild(message, author, channel, guild);
    if (channel.type === 'group') return this.handleGroupDM(message, author, channel);
    if (channel.type === 'dm') return this.handleDM(message, author, channel);
    let cmdArgs = message.content.split(' ');

    if (channel.type === 'text') {
      if (cmdArgs[0].substring(0, this.client.defaults.prefix.length) !== this.client.defaults.prefix) return false;

      const command = this.getCommand(message);
      if (command !== null) {
        if (command.dmOnly === true) return false;
        if (typeof command.message === 'string') {
          channel.sendMessage(command.message);
        } else if (typeof command.message === 'function') {
          command.message(message, author, channel, guild, this.client);
        } else if (command.responses.length > 1) {
          let response = command.responses[Math.random() * (command.responses.length - 1)];
          if (typeof response === 'string') {
            return channel.sendMessage(response);
          } else if (typeof response === 'function') {
            return response(message, author, channel, guild, this.client);
          }
        }
      }
    }
    return this.client.emit('nonCommand', message);
  }
  handleGroupDM(message, author, group) {
    let cmdArgs = message.content.split(' ');
    if (cmdArgs[0].substring(0, this.client.defaults.prefix.length) !== this.client.defaults.prefix) return false;
    const command = this.getCommand(message);
    if (command) {
      if (command.guildOnly === true) return false;
      if (typeof command.message === 'string') {
        return group.sendMessage(command.message);
      } else if (typeof command.message === 'function') {
        return command.message(message, author, group, this.client);
      } else if (command.responses.length > 1) {
        let response = command.responses[Math.random() * (command.responses.length - 1)];
        if (typeof response === 'string') {
          return group.sendMessage(response);
        } else if (typeof response === 'function') {
          return response(message, author, group, this.client);
        }
      }
    }
    return this.client.emit('nonCommand', message);
  }

  handleDM(message, author, dmChannel) {
    let cmdArgs = message.content.split(' ');
    if (cmdArgs[0].substring(0, this.client.defaults.prefix.length) !== this.client.defaults.prefix) return false;
    const command = this.getCommand(message);
    if (command) {
      if (command.guildOnly === true) return false;
      if (typeof command.message === 'string') {
        return dmChannel.sendMessage(command.message);
      } else if (typeof command.message === 'function') {
        return command.message(message, author, dmChannel, this.client);
      } else if (command.responses.length > 1) {
        let response = command.responses[Math.random() * (command.responses.length - 1)];
        if (typeof response === 'string') {
          return dmChannel.sendMessage(response);
        } else if (typeof response === 'function') {
          return response(message, author, dmChannel, this.client);
        }
      }
    }
    return this.client.emit('nonCommand', message);
  }

  perGuild(message, author, channel, guild) {
    const command = this.getCommand(message, true);
    if (command) {
      if (command.dmOnly === true) return false;
      if (typeof command.message === 'string') {
        return channel.sendMessage(command.message);
      } else if (typeof command.message === 'function') {
        return command.message(message, author, channel, guild, this.client);
      } else if (command.responses.length > 1) {
        let response = command.responses[Math.random() * (command.responses.length - 1)];
        if (typeof response === 'string') {
          return channel.sendMessage(response);
        } else if (typeof response === 'function') {
          return response(message, author, channel, guild, this.client);
        }
      }
    }
    return this.client.emit('nonCommand', message);
  }

  getCommand(message, perGuild = false) {
    let command = null;
    if (perGuild) {
      let args = message.content.split(' ');
      let label = args[0].substring(message.guild.prefix.length);
      label = this.client.registry.aliases.get(label) || label;
      if ((command = this.client.registry.commands.get(label) !== undefined) || (command = this.client.registry.commands.get(label.toLowerCase()) !== undefined && !command.caseSensitive)) {
        if (args.length > 1) command = this.getSubCommand(args.splice(0, 1), command) || command;
      }
      this.client.registry.plugins.forEach(plugin => {
        if (message.guild.enabledPlugins.indexOf(plugin.id) !== -1) {
          if ((command = plugin.commands.get(label) !== undefined) || ((command = plugin.commands.get(label.toLowerCase()) !== undefined) && !command.caseSensitive)) {
            if (args.length > 1) command = this.getSubCommand(args.splice(0, 1), command) || command;
          }
        }
      });
      return command;
    } else {
      let args = message.content.split(' ');
      let label = args[0].substring(this.client.defaults.prefix.length);

      label = this.client.registry.aliases.get(label) || label;
      if ((command = this.client.registry.commands.get(label)) !== undefined || ((command = this.client.registry.commands.get(label.toLowerCase())) !== undefined && !command.caseSensitive)) {
        if (args.length > 1) command = this.getSubCommand(args.splice(0, 1), command) || command;
      }

      this.client.registry.plugins.forEach(plugin => {
        label = plugin.aliases.get(label) || label;
        if (((command = plugin.commands.get(label)) !== undefined) || (((command = plugin.commands.get(label.toLowerCase())) !== undefined) && !command.caseSensitive)) {
          if (args.length > 1) command = this.getSubCommand(args.splice(0, 1), command) || command;
        }
      });
      return command;
    }
  }

  getSubCommand(args, command) {
    let id = command.subCommandAliases.get(args[0]) || args[0];
    let subCommand;
    if ((subCommand = command.subCommands.get(id)) !== undefined || ((subCommand = command.subCommands.get(id.toLowerCase())) !== undefined && !subCommand.caseSensitive)) {
      if (args.length > 1) return this.getSubCommand(args.splice(0, 1), command);
      return subCommand;
    }
    return command;
  }
}


module.exports = commandHandler;
