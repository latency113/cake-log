import { CreateTeamDto, UpdateTeamDto, } from '@/features/services/Team/Team.schema';
import Elysia, { t } from "elysia";
import { TeamSchema, TeamWithRelationsSchema } from "../../services/Team/Team.schema";
import { TeamService } from "../../services/Team/Team.service";
import { auth } from "@/shared/middleware/auth";

export namespace TeamController {
  export const teamController = new Elysia({ prefix: "/teams" })
    .use(auth)
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newTeam = await TeamService.create(body);
          set.status = 201;
          return { newTeam, message: "Team has been created" };
        } catch (error: any) {
          if (error.message === "Team name already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        body: CreateTeamDto,
        response: {
          201: t.Object({
            newTeam: TeamSchema,
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Teams"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .get(
      "/",
      async ({ query, set }) => {
        const page = query.page ? Number(query.page) : 1;
        const itemsPerPage = query.itemsPerPage
          ? Number(query.itemsPerPage)
          : 10;
        const search = query.search;
        const team_type = query.team_type as "team" | "person" | undefined;

        const result = await TeamService.findAll({
          page,
          itemsPerPage,
          search,
          team_type,
        });

        return result;
      },
      {
        query: t.Object({
          page: t.Optional(t.Numeric()),
          itemsPerPage: t.Optional(t.Numeric()),
          search: t.Optional(t.String()),
          team_type: t.Optional(t.Union([t.Literal("team"), t.Literal("person")])),
        }),
        response: {
          200: t.Object({
            data: t.Array(TeamWithRelationsSchema),
            meta_data: t.Object({
              page: t.Number(),
              itemsPerPage: t.Number(),
              total: t.Number(),
              totalPages: t.Number(),
              nextPage: t.Boolean(),
              previousPage: t.Boolean(),
            }),
          }),
          404: t.Object({
            message: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Teams"],
        isSignIn: true
      }
    )
    .get(
      "/:teamId",
      async ({ params: { teamId }, set }) => {
        try {
          const team = await TeamService.findById(teamId);
          return team;
        } catch (error: any) {
          if (error.message === "Team not found") {
            set.status = "Not Found";
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          teamId: t.String(),
        }),
        response: {
          200: TeamWithRelationsSchema,
          404: t.String(),
          500: t.String(),
        },
        tags: ["Teams"],
        isSignIn: true
      }
    )
    .patch(
      "/:teamId",
      async ({ params: { teamId }, body, set }) => {
        try {
          const updatedTeam = await TeamService.update(teamId, body);
          return { updatedTeam, message: "Team has been updated" };
        } catch (error: any) {
          if (error.message === "Team not found") {
            set.status = "Not Found";
            return error.message;
          }
          if (error.message === "Team name already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          teamId: t.String(),
        }),
        body: UpdateTeamDto,
        response: {
          200: t.Object({
            updatedTeam: TeamSchema,
            message: t.String(),
          }),
          404: t.String(),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Teams"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    )
    .delete(
      "/:teamId",
      async ({ params: { teamId }, set }) => {
        try {
          await TeamService.remove(teamId);
          return { message: "Team has been deleted" };
        } catch (error: any) {
          if (error.message === "Team not found") {
            set.status = "Not Found";
            return error.message;
          }
          set.status = "Internal Server Error";
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          teamId: t.String(),
        }),
        response: {
          200: t.Object({
            message: t.String(),
          }),
          404: t.String(),
          500: t.String(),
        },
        tags: ["Teams"],
        isSignIn: true,
        hasRole: ["SUPERADMIN", "ADMIN"]
      }
    );
}