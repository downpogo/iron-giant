import { Link } from "@tanstack/react-router"
import type { Repository } from "@iron-giant/core/domain"

type RepoListProps = {
  repositories: Array<Repository>
}

export function RepoList(props: RepoListProps) {
  const { repositories } = props

  return (
    <div className="border-r p-4">
      <h1 className="text-xl font-bold mb-5">
        <Link to="/">Repositories</Link>
      </h1>

      <div className="flex flex-col gap-3">
        {repositories.map((repo) => (
          <Link
            to="/repo/$repoID/task"
            params={{ repoID: repo.id }}
            key={repo.id}
            className="flex flex-col gap-1 border rounded-md px-4 py-2"
          >
            <span>{repo.name}</span>
            <span className="text-muted-foreground truncate">{repo.url}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
