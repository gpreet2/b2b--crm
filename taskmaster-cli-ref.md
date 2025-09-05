# Task Master CLI Reference

Replace Task Master MCP calls with these CLI commands to save 18.8k tokens.

## Core Workflow Commands

### Task Listing & Navigation
```bash
# List all tasks (replaces mcp__taskmaster-ai__get_tasks)
task-master list
task-master list --status=pending
task-master list --tag=main

# Get specific task details (replaces mcp__taskmaster-ai__get_task)  
task-master show <id>
task-master show 4

# Find next task to work on (replaces mcp__taskmaster-ai__next_task)
task-master next
```

### Task Status Management
```bash
# Set task status (replaces mcp__taskmaster-ai__set_task_status)
task-master set-status --id=<id> --status=<status>
task-master set-status --id=4 --status=done
task-master set-status --id=5 --status=in-progress

# Available statuses: pending, done, in-progress, review, deferred, cancelled
```

### Task Creation & Management
```bash
# Add new task (replaces mcp__taskmaster-ai__add_task)
task-master add --prompt="Implement user authentication"

# Add subtask (replaces mcp__taskmaster-ai__add_subtask)  
task-master add-subtask --id=<parent_id> --title="Create login form"

# Update task (replaces mcp__taskmaster-ai__update_task)
task-master update --id=<id> --prompt="Add OAuth integration details"
```

## Project Management Commands

### Task Expansion & Analysis
```bash
# Expand task into subtasks (replaces mcp__taskmaster-ai__expand_task)
task-master expand --id=<id> --num=5
task-master expand --id=4 --research

# Expand all pending tasks (replaces mcp__taskmaster-ai__expand_all)
task-master expand-all --force

# Analyze complexity (replaces mcp__taskmaster-ai__analyze_project_complexity)
task-master analyze --threshold=5
```

### PRD & Initialization
```bash
# Parse PRD document (replaces mcp__taskmaster-ai__parse_prd)
task-master parse-prd --input=.taskmaster/docs/prd.txt --num=10

# Initialize project (replaces mcp__taskmaster-ai__initialize_project)
task-master init --project-root=/path/to/project
```

### Dependencies & Organization
```bash
# Move tasks (replaces mcp__taskmaster-ai__move_task)
task-master move --from=<id> --to=<id>

# Add dependency (replaces mcp__taskmaster-ai__add_dependency)
task-master add-dependency --id=<id> --depends-on=<dep_id>

# Remove task (replaces mcp__taskmaster-ai__remove_task)
task-master remove --id=<id> --confirm
```

## Tag Management
```bash
# List tags (replaces mcp__taskmaster-ai__list_tags)
task-master tags list

# Create tag (replaces mcp__taskmaster-ai__add_tag)
task-master tags add --name="feature-auth" --description="Authentication work"

# Switch tag context (replaces mcp__taskmaster-ai__use_tag)
task-master tags use --name="feature-auth"
```

## Research & Advanced
```bash
# Research with context (replaces mcp__taskmaster-ai__research)
task-master research --query="How to implement OAuth with Convex" --save-to=4

# Generate task files (replaces mcp__taskmaster-ai__generate)
task-master generate

# Complexity report (replaces mcp__taskmaster-ai__complexity_report)
task-master complexity-report
```

## Usage Notes

- **No API Key Required**: Uses your existing Claude Code authentication
- **Context Aware**: Automatically uses `.taskmaster/` configuration in current project
- **Output Parsing**: Parse CLI output with standard text processing in Bash tool
- **Performance**: Saves 18.8k tokens compared to MCP usage

## Common Patterns

### Check Status → Work on Next Task
```bash
task-master list --status=pending
task-master next
task-master set-status --id=<next_id> --status=in-progress
```

### Complete Task → Update Status  
```bash
task-master set-status --id=<current_id> --status=done
task-master next
```

### Expand Complex Task
```bash
task-master show <id>
task-master expand --id=<id> --research --num=5
task-master list --status=pending
```