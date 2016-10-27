CREATE TABLE [dbo].[WebsiteDomains] (
    [websiteId]           INT           NOT NULL,
    [domain]              NVARCHAR (50) NOT NULL,
    [datecreated]         DATETIME      NOT NULL,
    [googletoken]         VARCHAR (MAX) NULL,
    [googleprofileId]     VARCHAR (20)  NULL,
    [googlewebpropertyId] VARCHAR (20)  NULL, 
    CONSTRAINT [PK_WebsiteDomains] PRIMARY KEY ([domain])
);


GO

CREATE INDEX [index_websiteDomains] ON [dbo].[WebsiteDomains] (websiteId)
