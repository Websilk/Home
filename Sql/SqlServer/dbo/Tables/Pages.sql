CREATE TABLE [dbo].[Pages] (
    [pageId]             INT            NOT NULL,
    [ownerId]            INT            NOT NULL,
    [websiteId]          INT            NOT NULL,
    [parentId]           INT            NULL,
    [templateId]         INT            NULL, /* when creating new child pages, clone the contents of a template page */
    [pagetype]			 SMALLINT		NULL, 
    [favorite]           BIT            NULL DEFAULT 0,
    [security]           BIT            NULL DEFAULT 0,
    [published]          BIT            NOT NULL DEFAULT 0,
    [enabled]            BIT            NOT NULL DEFAULT 1,
    [deleted]            BIT            NOT NULL DEFAULT 0,
	[version]			 INT			NOT NULL DEFAULT 0,
    [rating]             INT            NULL DEFAULT 0,
    [ratingtotal]        INT            NULL DEFAULT 0,
    [ratingcount]        INT            NULL DEFAULT 0,
    [datecreated]        DATETIME       NOT NULL DEFAULT GETDATE(),
    [datemodified]       DATETIME       NOT NULL DEFAULT GETDATE(),
    [datefirstpublished] DATETIME       NOT NULL DEFAULT GETDATE(),
    [datepublished]      DATETIME       NOT NULL DEFAULT GETDATE(),
	[layout]			 NVARCHAR (30) NOT NULL DEFAULT '',
	[service]			 NVARCHAR (100) NOT NULL DEFAULT '',
    [title]              NVARCHAR (250) NOT NULL DEFAULT '',

	/*title used in web page <head><title></title></head> */
    [title_head]         NVARCHAR (250) NOT NULL DEFAULT '', 

    [description]        NVARCHAR (160) NOT NULL DEFAULT '',
    [path]               NVARCHAR (512) NOT NULL DEFAULT '',
    [pathIds]            NVARCHAR (100) NOT NULL DEFAULT '',
    [pathlvl] INT NOT NULL DEFAULT 0, 
    CONSTRAINT [PK_Pages] PRIMARY KEY ([pageId])
);


GO

CREATE INDEX [index_pages] ON [dbo].[Pages] (websiteId, pageId)
