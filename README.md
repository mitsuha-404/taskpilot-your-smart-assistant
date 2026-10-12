 # TaskPilot

**Smart Workforce Allocation & Task Prioritization**

TaskPilot is a team task-management prototype designed to help teams prioritize work, assign tasks to suitable people, and understand workload before making allocation decisions.

Instead of assigning every new task to whoever has the most free time, TaskPilot considers required skills, skill proficiency, task difficulty, availability, and current workload. It aims to make recommendations understandable so that people can review them and make the final decision.

> **Project status:** Hackathon MVP / prototype. Features described as planned or in progress should be verified in the running application before being presented as complete.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [How Smart Assignment Works](#how-smart-assignment-works)
- [Example Scenario](#example-scenario)
- [Technology and Data Storage](#technology-and-data-storage)
- [Getting Started](#getting-started)
- [How to Use TaskPilot](#how-to-use-taskpilot)
- [Testing Checklist](#testing-checklist)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Team and Credits](#team-and-credits)
- [License](#license)

## Problem Statement

Teams often struggle to distribute work fairly and efficiently. A team member with the right skills may already be overloaded, while another person may have spare capacity but lack the proficiency required for a complex task.

Assigning work based only on availability can lead to poor task fit, delays, uneven workload, and avoidable rework. TaskPilot addresses this problem by bringing task prioritization, skill-aware assignment suggestions, and workload visibility into one workspace.

## Our Solution

TaskPilot provides a simple workspace where users can:

1. Create and manage tasks.
2. View task deadlines, effort estimates, priorities, required skills, assignees, and status.
3. Review team members' skills, proficiency, availability, and workload.
4. Receive explainable assignment recommendations.
5. Explore alternatives when a suitable team member is overloaded.
6. Keep control of final decisions through manual assignment and confirmation.

The system is intended to support human decision-making, not replace it.

## Key Features

### 1. Task Management

Tasks can include information such as:

- Task title and description
- Deadline
- Estimated effort in hours
- Required skill
- Task difficulty
- Priority
- Assignee
- Status, such as **To do**, **In progress**, or **Done**

Users should be able to add, edit, search, filter, sort, and update tasks, depending on the features available in the current build.

### 2. Task Prioritization

TaskPilot can display a priority score and priority level to help users identify work that needs attention.

The exact formula depends on the implementation in the current app. If the app uses a weighted formula based on deadline urgency, business importance, and effort, document the actual weights and scoring rules here after confirming them in the code or the **Priority rules** screen.

Priority scores are decision-support indicators. They should not be treated as guaranteed predictions of business impact.

### 3. Skill-Aware Team Profiles

Team profiles can record each member's proficiency for individual skills, for example:

- Frontend
- Backend
- UI/UX
- Data Analysis
- Testing
- Documentation

A proficiency scale may use:

| Level | Meaning |
|---|---|
| Beginner | Can complete suitable introductory tasks, often with guidance |
| Intermediate | Can complete routine tasks with some independence |
| Advanced | Can handle complex tasks independently |
| Expert | Can handle difficult tasks and support or mentor others |

A member may be advanced in one skill and a beginner in another. Proficiency should therefore be recorded per skill, not as one overall rating.

### 4. Capability-Aware Assignment

Assignment recommendations should consider more than free time. Relevant factors include:

- Whether the member has the required skill
- Whether their proficiency meets the task's difficulty
- Their remaining capacity and current workload
- Their availability
- The task's deadline and priority, where supported by the implementation

A person who has free time but does not meet the task's skill requirements should not automatically be recommended as the independent owner of that task.

### 5. Alternatives for Overloaded Team Members

When the most suitable person is overloaded, TaskPilot can guide the user through three possible approaches:

**Option A — Find another qualified person**

Look for another member who meets the task's skill and difficulty requirements and has enough capacity.

**Option B — Split the task into subtasks**

Break the task into smaller, meaningful pieces. Each subtask should have its own effort estimate, required skill, difficulty, and assignee. Subtasks should remain linked to the original task, and workload calculations must avoid counting the same effort twice.

**Option C — Redistribute existing work**

Review lower-priority tasks assigned to the overloaded person and consider moving them to other qualified members with sufficient capacity. Proposed changes should be explained and confirmed by a user before they are applied.

If none of the options is feasible, the app should say so clearly and suggest human review rather than inventing a suitable assignee.

### 6. Explainable Recommendations and Manual Control

A recommendation should explain why a person was suggested—for example, skill proficiency, remaining capacity, and availability.

The app should distinguish between:

- **Suggested assignee:** the system's recommendation
- **Actual assignee:** the person currently assigned by the user

Manual changes should remain possible. If a user selects someone whose proficiency is below the task requirement, the app should display a clear warning rather than silently preventing or changing the decision.

### 7. Workload Visibility

The Workload page can help users compare assigned effort with available capacity. Workload should update when task assignments or statuses change.

The exact calculation should be consistent throughout the app. For example, the app should define whether completed tasks are excluded from active workload and how subtasks contribute to effort totals.

## How Smart Assignment Works

A high-level workflow is:

1. **Read the task requirements.** Identify the required skill, difficulty, effort, deadline, and priority.
2. **Identify eligible members.** Check whether each member has the required skill and sufficient proficiency.
3. **Check capacity and availability.** Estimate whether eligible members can take on the work.
4. **Compare suitable candidates.** Rank eligible people using the factors implemented in the app.
5. **Explain the recommendation.** Show the reasons and any workload or deadline warnings.
6. **Offer alternatives if needed.** Consider another qualified member, task splitting, or redistribution of existing work.
7. **Let the user decide.** Apply assignments only through the app's supported confirmation or manual-edit workflow.

This is a rule-based decision-support approach. Do not describe it as artificial intelligence or machine learning unless the project actually implements and evaluates those methods.

## Example Scenario

Imagine a complex Backend task that requires **Advanced** proficiency.

- **Alex:** Expert in Backend, but close to full capacity.
- **Olivia:** Beginner in Backend, with plenty of free capacity.
- **Marcus:** Advanced in Backend, with enough remaining capacity.

A capability-aware recommendation should consider Marcus as a qualified alternative rather than assigning the task to Olivia solely because she is less busy.

If no qualified member has enough capacity, TaskPilot should show that no suitable assignee is currently available and help the user review the alternatives.

*Names and figures in this example are illustrative.*

## Technology and Data Storage

TaskPilot is built through Lovable. The precise frontend framework, dependencies, and storage approach should be confirmed from the connected GitHub repository before this section is treated as a definitive technical specification.

The current interface indicates that changes may be saved on the device. If the app uses browser storage such as `localStorage`:

- Data is generally stored in that browser on that device.
- Data does not automatically synchronize between teammates or devices.
- Clearing browser data may remove locally stored project data.
- A shared database and suitable backend or hosted service would be needed for reliable multi-user synchronization.

Do not put passwords, API keys, or other secrets in frontend code or a public repository.

## Getting Started

### Use the hosted app

If the project has been published, open the live URL provided by Lovable. The URL should be tested in a fresh browser tab before it is shared with judges or teammates.

### Work with the source code

1. Open the GitHub repository connected to Lovable.
2. Check that the latest project changes have been synchronized.
3. Read the repository's actual setup files, such as `package.json` and any project-specific instructions.
4. Follow the installation and development commands defined by that project.

Because the exact generated project configuration can change, do not assume commands or dependencies until you have checked the repository.

## How to Use TaskPilot

1. Open the **Tasks** page to review task priorities, deadlines, effort, skills, assignees, and status.
2. Add a task with clear requirements and a realistic effort estimate.
3. Open **Team** to review team members' skills, proficiency, availability, and capacity.
4. Review the suggested assignee and read the explanation.
5. If the recommended person is overloaded, explore alternative qualified members, task splitting, or workload redistribution.
6. Confirm any proposed changes before applying them.
7. Open **Workload** to review how the allocation affects the team.
8. Update task status as work progresses.

Labels and available actions may differ slightly depending on the current build.

## Testing Checklist

Before presenting the MVP, test the following manually:

- [ ] Add a task and confirm that it appears in the list.
- [ ] Edit a task and confirm the updated details are saved.
- [ ] Delete a task, if deletion is supported.
- [ ] Check priority scoring and sorting against the displayed rules.
- [ ] Check overdue, due-today, and future deadline labels.
- [ ] Change a task's status and verify summary counts.
- [ ] Verify that recommendations respect skill and proficiency requirements.
- [ ] Confirm that an overloaded member triggers alternatives where appropriate.
- [ ] Verify that an unqualified member is not suggested as an independent assignee.
- [ ] Test task splitting and ensure effort is not double-counted, if implemented.
- [ ] Test workload redistribution and confirm that changes require user approval.
- [ ] Confirm that workload totals update after assignment and status changes.
- [ ] Refresh the browser and check whether data persists.
- [ ] Test search, filters, form validation, and mobile layout.
- [ ] Test the published website separately from Lovable Preview.

Only mark a test as passed after actually performing it.

## Limitations

Depending on the current implementation, TaskPilot may have some or all of these limitations:

- Demo data may be fictional and not connected to a real organization.
- Device-local storage does not provide shared real-time collaboration.
- Skill proficiency is only as reliable as the information entered by users.
- Rule-based scores are recommendations, not guarantees of successful delivery.
- Deadline, effort, capacity, and priority estimates may be inaccurate.
- Task splitting and workload redistribution require human review to preserve context and avoid creating new bottlenecks.

Clearly disclose which features are implemented, partially implemented, or planned when demonstrating the project.

## Future Improvements

Potential next steps include:

- Shared database and authenticated multi-user access
- Role-based permissions and an audit trail for assignment changes
- Better capacity planning across a team or sprint
- Dependency tracking between tasks
- Notifications for approaching deadlines and overload risks
- Reporting on completed work and estimation accuracy
- Integration with project-management tools
- Evaluation of recommendation quality using real, permissioned project data

## Contributing

For a hackathon team, a practical contribution workflow is:

1. Discuss the change and agree on its scope.
2. Create a branch or follow the team's chosen GitHub workflow.
3. Make a focused change and test it.
4. Review the diff before merging or syncing.
5. Update this README when behaviour, setup steps, or requirements change.

Avoid committing credentials, private information, or real employee data.

## Team and Credits

- **Project:** TaskPilot
- **Purpose:** Workforce allocation and task prioritization
- **Built with:** Lovable and the technologies present in the connected repository
- **Data:** Use fictional demo data unless real data is explicitly authorized

Add your team members, institution, hackathon name, and individual contributions here before submission.

## License

No license has been specified yet. If you intend to make the repository public or allow others to reuse the code, choose an appropriate license and add its license file. Until then, do not assume that others have permission to reuse the project.
