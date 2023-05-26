import { GraphQLError } from "graphql";
import {
  getJob,
  getJobs,
  getJobByCompany,
  createJob,
  deleteJob,
  updateJob,
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
    jobs: () => getJobs(),
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
    deleteJob: (__root, { id }) => deleteJob(id),
    updateJob: (__root, { input: { id, title, description } }) => {
      return updateJob({ id, title, description });
    },
  },
  Company: {
    jobs: (company) => getJobByCompany(company.id),
  },
  Job: {
    company: (job) => getCompany(job.companyId),
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
