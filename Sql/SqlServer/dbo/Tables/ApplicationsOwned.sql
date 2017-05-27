CREATE TABLE [dbo].[ApplicationsOwned] (
    [applicationId] INT        NOT NULL,
    [websiteId]     INT        NOT NULL,
    [datecreated]   DATETIME   NOT NULL, 
    CONSTRAINT [PK_ApplicationsOwned] PRIMARY KEY ([websiteId]) 
);


GO

CREATE INDEX [index_appsOwned] ON [dbo].[ApplicationsOwned] (websiteId)