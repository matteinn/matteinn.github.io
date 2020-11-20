---
layout: post
title: "Github issues and PRs templates"
date: "2020-11-17 22:07:30 +0100"
tag: github
---

In this post I'll wander through Github templates as a way to standardise issues and pull requests formatting.

## Background

When working on a team communication is the real key to success. This should be applied also when filing bugs and committing changes to your repository.

When creating an issue you are most likely presented with a blank text box: it's common to get annoyed and just write a couple of sentences that at that time seem enough to describe what needs to be built (apropos a new feature) or fixed (in case of bugs or crashes). When that issue will be taken in charge, we can assume by another person, there are big chances that its description won't be clear enough for him and that could lead to some drift in the perceived specs and a waste of resources on the long term.

The same happen when a developer is done with his job and creates a pull request for someone else to validate it and merge it. He's just finished with his task, so "why do I have to explain in human words what I have already written in code?":
1. the reviewer(s) may not be familiar at all with the chunk of code that has been edited
2. explaining what has been done may bring to the author's mind some alternate ways to achieve the same goal, perhaps in a cleaner way. This could lead to some team discussion and/or further improvements of the PR
3. what today seems obvious to the author won't probably be the same in a couple of months when looking back at changes made in the past, for instance when troubleshooting the same chunk of code trying to backtrack the source of an issue. Things will get even worse when the task is assigned to a different developer.

How can you improve this process and make everyone's life easier?

👉Github templates to the rescue!

Github allows creating one or more templates for both issues and PRs, let's see how to get started.

## Issues

Issues templates must be stored on the repository's default branch in a hidden directory named `.github/ISSUE_TEMPLATE` where you will put `.md` files, one for each template. Each template must contain valid `name` and `about` YAML front matter in order to show up in the template chooser.

![Issue template chooser](/assets/img/posts/github-templates/issue-chooser.png)

![Issue template](/assets/img/posts/github-templates/issue.png)

Here's a typical bug report template:

```yaml
---
name: "\U0001F41B Bug report"
about: Report a problem encountered while using the app

---

### Describe the bug

<!--
A clear and concise description of what the bug is.
-->

### Version & OS

<!--
Open the settings page to see the app version and build number, e.g. 5.0.0 (1234), and also include any details about the device (model and OS version are highly recommended).
-->

### Steps to reproduce the behavior

<!--
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error
-->

### Expected behavior

<!--
A clear and concise description of what you expected to happen.
-->

### Actual behavior

<!--
A clear and concise description of what actually happened.
-->

### Screenshots/videos

<!--
Add screenshots or videos to help explain your problem, if applicable.
-->

```


## Pull Requests

PR template must be stored on the repository's default branch in any of the following spots:
- in the `root` directory `pull_request_template.md`
- in the `docs` directory `docs/pull_request_template.md`
- in the hidden `.github` directory `.github/pull_request_template.md`

![PR template](/assets/img/posts/github-templates/pr.png)

You can still add more than one template for PRs by adding them to a directory named `PULL_REQUEST_TEMPLATE` in the same aforementioned directories (root, `docs` and `.github`) but, as opposed to issues, there is no template chooser available as of today so you will have to rely on the template query parameter to enforce one template or another.
https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/about-automation-for-issues-and-pull-requests-with-query-parameters

## References

For a complete example of how to structure a github repository to support templates you can have a look [here](https://github.com/matteinn/Test-Templates) for a collection of 3 common issue templates and one PR template that I came up with based on some contractor projects needs.

As usual you can rely on the [relevant page](https://docs.github.com/en/free-pro-team@latest/github/building-a-strong-community/about-issue-and-pull-request-templates) on the Github docs for further details.
