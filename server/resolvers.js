import { GraphQLError } from "graphql";
import { getJob, getJobs, getJobByCompany } from "./db/jobs.js";
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

function toIsoDate(value) {
  return value.slice(0, "yyyy-mm-dd".length);
}
