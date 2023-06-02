import { GraphQLError } from "graphql";
import {
  getJob,
  getJobs,
  getJobByCompany,
  createJob,
  deleteJob,
  updateJob,
  countJobs,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
export const resolvers = {
  Query: {
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError(`No Company found with id ${id} `);
      }
      return company;
    },
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError(`No Job found with id ${id}`);
      }
      return job;
    },
    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return { items, totalCount };
    },
  },
  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      console.log("[create job] context:", user);
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const { companyId } = user;
      return createJob({ companyId, title, description });
    },
    deleteJob: async (__root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }

      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError("No job found with id ", id);
      }
      return job;
    },
    updateJob: async (
      __root,
      { input: { id, title, description } },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await updateJob({
        id,
        companyId: user.companyId,
        title,
        description,
      });
      if (!job) {
        throw notFoundError("No Job found with id", id);
      }
      return job;
    },
  },
  Company: {
    jobs: (company) => getJobByCompany(company.id),
  },
  Job: {
    company: (job, _args, { companyLoader }) => {
      return companyLoader.load(job.companyId);
    }, //getCompany(job.companyId),
    date: (job) => toIsoDate(job.createdAt),
  },
};
function notFoundError(message) {
  throw new GraphQLError(message, {
    extensions: { code: "NOT FOUND" },
  });
}
function unauthorizedError(message) {
  throw new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
}
function toIsoDate(value) {
  return value.slice(0, "yyyy-mm-dd".length);
}
