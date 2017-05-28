﻿-- =============================================
-- Author:		Mark Entingh
-- Create date: 6/17/2015 3:06 AM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Page_Info_GetFromDomain]
	@domain nvarchar(200)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @pId int
	SELECT @pId = p.pageid FROM websitedomains w LEFT JOIN pages p ON p.pageid=(SELECT w2.pagehome FROM websites w2 WHERE w2.websiteid=w.websiteid) WHERE w.domain = @domain AND p.deleted=0
    EXEC Page_Info_GetFromPageId @pageId=@pId
END