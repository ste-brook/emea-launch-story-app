import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface MCPConfig {
  command: string;
  args: string[];
}

export class MCPClient {
  private process: any;
  private config: MCPConfig;

  constructor(config: MCPConfig) {
    this.config = config;
  }

  async start() {
    try {
      this.process = spawn(this.config.command, this.config.args);
      
      this.process.stdout.on('data', (data: Buffer) => {
        console.log(`MCP stdout: ${data}`);
      });

      this.process.stderr.on('data', (data: Buffer) => {
        console.error(`MCP stderr: ${data}`);
      });

      this.process.on('close', (code: number) => {
        console.log(`MCP process exited with code ${code}`);
      });

      return true;
    } catch (error) {
      console.error('Failed to start MCP:', error);
      return false;
    }
  }

  async stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  async executeCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.error(`MCP command stderr: ${stderr}`);
      }
      return stdout;
    } catch (error) {
      console.error('Failed to execute MCP command:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const mcpClient = new MCPClient({
  command: '/opt/homebrew/bin/uvx',
  args: ['data-portal-mcp']
});

export default mcpClient; 