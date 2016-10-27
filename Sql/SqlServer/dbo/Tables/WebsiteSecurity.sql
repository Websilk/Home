CREATE TABLE [dbo].[WebsiteSecurity] (
    [websiteId] INT            NOT NULL,
    [pageId]    INT            NOT NULL,
    [userId]  INT            NOT NULL,
    [feature]   NVARCHAR (50)  NULL,
    [security]  NVARCHAR (25) NULL, 
    CONSTRAINT [PK_WebsiteSecurity] PRIMARY KEY ([userId])
);


GO

CREATE INDEX [index_websiteSecurity] ON [dbo].[WebsiteSecurity] (websiteId)
